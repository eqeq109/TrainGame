import { ZepetoScriptBehaviour, ZepetoScriptBehaviourComponent, ZepetoScriptInstance, ZepetoScriptContext } from 'ZEPETO.Script'
import { WorldMultiplayChatContent, ZepetoWorldMultiplay } from 'ZEPETO.World'
import { Room, RoomData, ArraySchema$1 } from 'ZEPETO.Multiplay'
import { Player, State, Vector, DateObject, Transform as PacketTransform } from 'ZEPETO.Multiplay.Schema'
import { CharacterState, SpawnInfo, ZepetoPlayers, ZepetoPlayer, ZepetoCharacter } from 'ZEPETO.Character.Controller'
import * as UnityEngine from "UnityEngine";
import { GameObject, Vector3 as UnityVector3, Mathf, Quaternion, Coroutine } from 'UnityEngine';
import { Text, Image } from 'UnityEngine.UI';
import Tail from "./Tail";
import Star from "./Star";
import Bomb from "./Bomb";
import ObjectPool from "./ObjectPool";
import { MarkManager, PlayerTails } from "./SnakeLogics";
import { Action$1 } from 'System';

class TransformData {
    position: VectorData = new VectorData();
    rotation: VectorData = new VectorData();
}
class VectorData {
    x: number = 0;
    y: number = 0;
    z: number = 0;
}

export default class Starter extends ZepetoScriptBehaviour {

    public multiplay: ZepetoWorldMultiplay;
    //기차 프리팹
    public tailPrefab: GameObject;
    //폭탄 프리팹
    public bombPrefab: GameObject;
    //별 프리팹
    public starPrefab: GameObject;
    //기차 물리 head
    public headPrefab: GameObject;

    public jointParentPrefab: GameObject;

    private room: Room;
    private currentPlayers: Map<string, Player> = new Map<string, Player>();
    //유저별 스네이크 객체 맵
    private playerTailsDatas: Map<string, PlayerTails> = new Map<string, PlayerTails>();

    private characterSessionIdMap: Map<number, string> = new Map<number, string>();

    private attackAvailableMap: Map<string, Date> = new Map<string, Date>();

    private hitAction: Action$1<string>;

    private catchStarAction: Function;

    private hitByBombAction: Function;

    private returnBombAction: Function;
   
    //꼬리간 거리
    private distanceBetweenCharacter: float = 0.7;
    private distanceBetween: float = 0.7;
    //움직임 체크
    private moveCheck: float = 0.001; 
    //기존 위치 기록
    private checkPosition: UnityVector3 = new UnityVector3(0, 0, 0);
    private checkPositionMap: Map<string, UnityVector3> = new Map<string, UnityVector3>();
    //꼬리 오브젝트 풀
    private tailObjectPool: ObjectPool<Tail>;
    //폭탄 오브젝트 풀
    private bombObjectPool: ObjectPool<Bomb>;
    //별 오브젝트 풀
    private starObjectPool: ObjectPool<Star>;

    //UI
    public textLevel: Text;
    public textExp: Text;
    public imageGauge: Image;
    
    private initCoroutine: Coroutine;

    private Start() {

        this.tailObjectPool = new ObjectPool<Tail>(16 * 5, this.tailPrefab);
        
        this.bombObjectPool = new ObjectPool<Bomb>(20, this.bombPrefab);
        
        this.starObjectPool = new ObjectPool<Star>(200, this.starPrefab);

        this.multiplay.RoomCreated += (room: Room) => {
            this.room = room;
        };
        
        this.multiplay.RoomJoined += (room: Room) => {
            room.OnStateChange += this.OnStateChange;

            room.AddMessageHandler("SpawnStar", (message: PacketTransform) => {
                console.log(message.position);
                const position: UnityEngine.Vector3 = this.ParseVector3(message.position);
                this.SpawnStar(position);
            });  

            room.AddMessageHandler("SpawnBomb", (message: PacketTransform) => {
                console.log(message.position);
                const position: UnityEngine.Vector3 = this.ParseVector3(message.position);
                this.SpawnBomb(position);
            });  
            
        };

        this.hitAction = (ownerId: string) => {this.OnAttackEvent(ownerId)};
        this.catchStarAction = (instanceId: number, star: GameObject) => {
            this.OnCatchStarEvent(instanceId, star);
        };

        this.hitByBombAction = (instanceId: number, bomb: GameObject) => {
            this.OnHitByBombEvent(instanceId, bomb);
        }

        this.returnBombAction = (bomb: GameObject) =>{
            this.ReturnBomb(bomb);
        }

        this.StartCoroutine(this.SendMessageLoop(0.1));
        this.StartCoroutine(this.UpdateSnakeMove(1 / 60));
        this.StartCoroutine(this.UpdateOpponentSnakeMove(1/ 60));
        this.StartCoroutine(this.CheckAttackAvailable());
    }

    private AddAvailableTimeCheck(sessionId: string, availableTime: Date){
        this.attackAvailableMap.set(sessionId, availableTime);
    }

    private * CheckAttackAvailable(){
       
        while(true){
            yield new UnityEngine.WaitForSeconds(0.1);
            if (this.room != null && this.room.IsConnected) {
                this.attackAvailableMap.forEach((value, key) => {
                    const now = new Date();
                    if(value <= now){
                        this.attackAvailableMap.delete(key);
                    }
                })
            }
            
        }
    }

    private Update(){
        
    }

    private SpawnStar(position: UnityEngine.Vector3){
        let star: GameObject = this.starObjectPool.GetObject();
        star.GetComponent<Star>().Init(this.catchStarAction, position);
    }

    private SpawnBomb(position: UnityEngine.Vector3){
        let bomb: GameObject = this.bombObjectPool.GetObject();
        bomb.GetComponent<Bomb>().Init(this.hitByBombAction, this.returnBombAction, position);
    }

    private ReturnBomb(bomb: GameObject){
        this.bombObjectPool.ReturnObject(bomb);
    }

    //플레이어 초기화
    public InitPlayer(sessionId: string, position: UnityEngine.Vector3, rotation: UnityEngine.Vector3) {
        
        const player = ZepetoPlayers.instance.GetPlayer(sessionId);

        const joint = GameObject.Instantiate<GameObject>(this.jointParentPrefab, player.character.gameObject.transform);
        
        let tails: PlayerTails = new PlayerTails();
        const exp = this.currentPlayers.get(sessionId).exp;
        console.log(`user ID and EXP :  ${this.currentPlayers.get(sessionId).zepetoUserId} : ${this.currentPlayers.get(sessionId).exp}.`);
        console.log(`EXP : ${this.currentPlayers.get(sessionId).exp}.`);

        //console.log(this.currentPlayers.get(sessionId).zepetoUserId + ':' + this.currentPlayers.get(sessionId).exp);
        const length = exp + 1;
        //head
        tails.markManagers.push(new MarkManager());

        for (let i = 0; i < length; i++) {
            let train: GameObject = this.tailObjectPool.GetObject(); //GameObject.Instantiate<GameObject>(this.tailPrefab);
            train.transform.position = position;
            tails.tails.push(train);
            //tails.tailTransforms.push(train.transform);
            tails.markManagers.push(new MarkManager());
            
            train.GetComponent<Tail>().Init(sessionId, i === 0, this.hitAction);   
        }

        const last: Tail = tails.tails[tails.tails.length - 1].GetComponent<Tail>();
        last.SetLast(true);
        
        this.playerTailsDatas.set(sessionId, tails);
    }

    private * InitPlayerAsync(sessionId: string, position: UnityEngine.Vector3, rotation: UnityEngine.Vector3){
        while(true){
            yield new UnityEngine.WaitForSeconds(0.1);
            if(ZepetoPlayers.instance.HasPlayer(sessionId)){
                this.characterSessionIdMap.set(ZepetoPlayers.instance.GetPlayer(sessionId).character.gameObject.GetInstanceID(), sessionId);
                
                console.log(`instance ID:  ${ZepetoPlayers.instance.GetPlayer(sessionId).character.gameObject.GetInstanceID()}.`);
                this.InitPlayer(sessionId, position, rotation);
                break;
            }
        }
    }

    // 일정 Interval Time으로 내(local)캐릭터 transform을 server로 전송합니다.
    private * SendMessageLoop(tick: number) {
        while (true) {
            yield new UnityEngine.WaitForSeconds(tick);

            if (this.room != null && this.room.IsConnected) {
                const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.room.SessionId);
                if (hasPlayer) {
                    const myPlayer = ZepetoPlayers.instance.GetPlayer(this.room.SessionId);
                    if (myPlayer.character.CurrentState != CharacterState.Idle) {
                        this.SendTransform(myPlayer.character.transform);
                    }
                    this.checkPositionMap.set(this.room.SessionId, myPlayer.character.transform.position);
                }
            }
        }
    }
    
    // 웁직임 체크
    private checkMove(curPos: UnityVector3, sessionId: string): boolean {
        if (UnityVector3.Distance(curPos, this.checkPositionMap.get(sessionId)) > this.moveCheck)
            return true;

        return false;
    }

    //스네이크 로직 함수
    private UpdateTails(sessionId: string){
        if(!this.playerTailsDatas.has(sessionId)){
            return;
        }
        const tails: PlayerTails = this.playerTailsDatas.get(sessionId);
        //UnityEngine.Debug.Log(tails);
        
        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);

        const exp = this.currentPlayers.get(sessionId).exp;
        const length = exp + 1;


        if (this.checkMove(zepetoPlayer.character.transform.position, sessionId)) {
            tails.markManagers[0].UpdateMarkList(zepetoPlayer.character.transform.position, zepetoPlayer.character.transform.rotation);


            for (let i = 0; i < tails.tails.length; i++) {
                const markManager: MarkManager = tails.markManagers[i + 1];
                markManager.UpdateMarkList(tails.tails[i].transform.position, tails.tails[i].transform.rotation);
            }
            //if (this.checkMove(zepetoPlayer.character.transform.position)) {
            const markManager: MarkManager = tails.markManagers[0];

            if (UnityVector3.Distance(zepetoPlayer.character.transform.position, tails.tails[0].transform.position) >= this.distanceBetweenCharacter) {
                while (UnityVector3.Distance(zepetoPlayer.character.transform.position, markManager.markList[0].position) > (this.distanceBetween + 0.1)) {
                    markManager.markList.shift();
                }
                //let t: float = Time.deltaTime * distance / this.distanceBetween * 10;
                tails.tails[0].transform.rotation = markManager.markList[0].rotation;//Quaternion.Lerp(tails.tails[i].transform.rotation, markManager.markList[0].rotation, 100 * Time.deltaTime);
                //let moveRotation: UnityVector3 = markManager.markList[0].position - tails.tails[0].transform.position ; 
                tails.tails[0].transform.position = markManager.markList[0].position;//GetComponent<Rigidbody>().MovePosition(markManager.markList[0].position);//.AddForce(moveRotation * 10, ForceMode.Force);// ////UnityVector3.Lerp(tails.tails[i].transform.position, markManager.markList[0].position, 100 * Time.deltaTime);
                markManager.markList.shift();
            }

            for (let i = 1; i < tails.tails.length; i++) {
                const markManager: MarkManager = tails.markManagers[i];

                try {

                    if (UnityVector3.Distance(tails.tails[i - 1].transform.position, tails.tails[i].transform.position) >= this.distanceBetween) {
                        while (UnityVector3.Distance(tails.tails[i - 1].transform.position, markManager.markList[0].position) > (this.distanceBetween + 0.1)) {
                            markManager.markList.shift();
                        }
                        tails.tails[i].transform.rotation = markManager.markList[0].rotation;//Quaternion.Lerp(tails.tails[i].transform.rotation, markManager.markList[0].rotation, 100 * Time.deltaTime);
                        //let moveRotation: UnityVector3 = markManager.markList[0].position - tails.tails[i].transform.position ; 
                        tails.tails[i].transform.position = markManager.markList[0].position;//GetComponent<Rigidbody>().MovePosition(markManager.markList[0].position);//.AddForce(moveRotation * 10, ForceMode.Force);//////UnityVector3.Lerp(tails.tails[i].transform.position, markManager.markList[0].position, 100 * Time.deltaTime);
                        markManager.markList.shift();
                    }


                }
                catch (e) {
                    console.log(e);
                    console.log(`index : ${i}.`);

                }
            }
        }
    }

    // 업데이트 코루틴
    private * UpdateSnakeMove(tick: number) {
        while (true) {
            yield new UnityEngine.WaitForSeconds(tick);

            if (this.room != null && this.room.IsConnected) {
                const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.room.SessionId); {
                    if (hasPlayer) {

                        this.UpdateTails(this.room.SessionId);
                    }
                }
            }
        }
    }

    private * UpdateOpponentSnakeMove(tick: number) {
        while(true) {
            yield new UnityEngine.WaitForSeconds(tick);
            if(this.room != null && this.room.IsConnected){
                this.currentPlayers.forEach((player: Player, sessionId: string) => {
                    if(ZepetoPlayers.instance.HasPlayer(sessionId)){
                        this.UpdateTails(sessionId);
                    }
                });
            }
        }
    }

    //TODO: 유저 접속 시 스폰 초기화
    private InitTailTransform(sessionId: string) {
        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);
        const tailData = this.playerTailsDatas.get(sessionId);

        const direction = new UnityVector3(zepetoPlayer.character.transform.forward.x * -1, zepetoPlayer.character.transform.forward.y * -1, zepetoPlayer.character.transform.forward.z * -1);

        for (let i = 1; i <= 3; i++) {
            const trainPos = new UnityVector3(zepetoPlayer.character.transform.position.x + (direction.x * (0.8 * i)), zepetoPlayer.character.transform.position.y + (direction.y * (0.8 * i)), zepetoPlayer.character.transform.position.z + (direction.z * (0.8 * i)));

            tailData.tails[i - 1].transform.position = trainPos;
        }
    }

    private OnStateChange(state: State, isFirst: boolean) {

        // 첫 OnStateChange 이벤트 수신 시, State 전체 스냅샷을 수신합니다.
        if (isFirst) {

            // [CharacterController] (Local)Player 인스턴스가 Scene에 완전히 로드되었을 때 호출
            ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
                const myPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;
                myPlayer.character.OnChangedState.AddListener((cur, next) => {
                    this.SendState(next);
                });
            });

            // [CharacterController] Player 인스턴스가 Scene에 완전히 로드되었을 때 호출
            ZepetoPlayers.instance.OnAddedPlayer.AddListener((sessionId: string) => {
                const isLocal = this.room.SessionId === sessionId;
                const player: Player = this.currentPlayers.get(sessionId);
                
                if(!isLocal){
                    
                    player.OnChange += (changeValues) => this.OnUpdatePlayer(sessionId, player);
                }
                player.OnChange += (changeValues) => this.OnUpdatePlayerData(sessionId, player);
                
            });
        }

        let join = new Map<string, Player>();
        let leave = new Map<string, Player>(this.currentPlayers);

        state.players.ForEach((sessionId: string, player: Player) => {
            if (!this.currentPlayers.has(sessionId)) {
                join.set(sessionId, player);
            }
            leave.delete(sessionId);
        });

        // [RoomState] Room에 입장한 player 인스턴스 생성
        join.forEach((player: Player, sessionId: string) => this.OnJoinPlayer(sessionId, player));

        // [RoomState] Room에서 퇴장한 player 인스턴스 제거
        leave.forEach((player: Player, sessionId: string) => this.OnLeavePlayer(sessionId, player));
    }

    private OnJoinPlayer(sessionId: string, player: Player) {
        console.log(`[OnJoinPlayer] players - sessionId : ${sessionId}`);
        this.currentPlayers.set(sessionId, player);

        const spawnInfo = new SpawnInfo();
        const position = this.ParseVector3(player.transform.position);
        const rotation = this.ParseVector3(player.transform.rotation);
        spawnInfo.position = position;
        spawnInfo.rotation = UnityEngine.Quaternion.Euler(rotation);
        
        const isLocal = this.room.SessionId === player.sessionId;
        ZepetoPlayers.instance.CreatePlayerWithUserId(sessionId, player.zepetoUserId, spawnInfo, isLocal);
        
        if(this.initCoroutine != null){
            this.StopCoroutine(this.InitPlayerAsync);
        }

        this.StartCoroutine(this.InitPlayerAsync(sessionId, position, rotation));

        if(sessionId == this.room.SessionId){
            this.UpdateUI(player);
        }
        //this.InitPlayer(sessionId);
    }

    private UpdateUI(player: Player){
        this.textLevel.text = (player.exp + 1).toString();
                //this.textExp.text = '0/1';
        this.imageGauge.fillAmount = 0;
    }

    //TODO: 꼬리 GameObject Pooling
    private OnLeavePlayer(sessionId: string, player: Player) {
        console.log(`[OnRemove] players - sessionId : ${sessionId}`);
        //꼬리객체 pool에 반환
        const tail: PlayerTails = this.playerTailsDatas.get(sessionId);
        tail.tails.forEach((object: GameObject) =>{
            this.tailObjectPool.ReturnObject(object);
        });
        
        //데이터 제거
        this.playerTailsDatas.delete(sessionId);

        this.currentPlayers.delete(sessionId);

        ZepetoPlayers.instance.RemovePlayer(sessionId);
    }

    // 필드 유저 업데이트
    private OnUpdatePlayer(sessionId: string, player: Player) {

        const isLocal = this.room.SessionId === sessionId;
        if(!isLocal){
            const position = this.ParseVector3(player.transform.position);

        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);
        zepetoPlayer.character.MoveToPosition(position);
        this.checkPositionMap.set(sessionId, position);

        if (player.state === CharacterState.JumpIdle) //|| player.state === CharacterState.JumpMove)
            zepetoPlayer.character.Jump();
        }
        


    }
    private OnUpdatePlayerData(sessionId: string, player: Player) {
        if (this.playerTailsDatas.has(sessionId)) {
            const tails: PlayerTails = this.playerTailsDatas.get(sessionId);

            const changedTailCount = player.exp + 1;

            //exp 증감에 따라 처리해준다.

            const minusTailCount = tails.tails.length - changedTailCount;
            if (minusTailCount > 0) {
                for (let i = 0; i < minusTailCount; i++) {
                    const tailObject: GameObject = tails.tails.pop();
                    //tails.tailTransforms.pop();
                    tails.markManagers.pop();
                    this.tailObjectPool.ReturnObject(tailObject);
                }

                tails.tails[tails.tails.length - 1].GetComponent<Tail>().SetLast(true);
            }

            const addTailCount = changedTailCount - tails.tails.length;
            if (addTailCount > 0) {
                for (let i = 0; i < addTailCount; i++) {
                    //console.log(player.exp);
                    const currentlast: Tail = tails.tails[tails.tails.length - 1].GetComponent<Tail>();
                    currentlast.SetLast(false);
                    const newLast: Tail = this.tailObjectPool.GetObject().GetComponent<Tail>();
                    newLast.Init(sessionId, false, this.hitAction);
                    tails.tails.push(newLast.gameObject);
                    newLast.SetLast(true);
                    tails.markManagers.push(new MarkManager());
                }
            }

            if (player.atkAvailable) {
                const date = this.ParseDateObject(player.atkAvailable);
                const now = new Date();
                if (date > now){
                    this.AddAvailableTimeCheck(sessionId, date);
                    tails.tails.forEach((tailElement: GameObject) => {
                        tailElement.GetComponent<Tail>().PlayHitAnimation();
                    })
                }
            }

            if(sessionId === this.room.SessionId){
                this.UpdateUI(player);
            }

            // if(sessionId !== this.room.SessionId){
            //     this.UpdateEnemyTailPos(sessionId, player);
            // }
        }
    }

    private UpdateEnemyTailPos(sessionId: string, player: Player){
        const tails: PlayerTails = this.playerTailsDatas.get(sessionId);
        
        if(player.tailTransforms.Count === 0){
            console.log('tailTransform is empty');
            return;
        }
        let loopCount: int = tails.tails.length;
        if (player.tailTransforms.Count as int !== tails.tails.length as int) {
            loopCount = player.tailTransforms.Count > tails.tails.length ? tails.tails.length : player.tailTransforms.Count;
        }

        for (let i = 0; i < loopCount; i++) {
            console.log(player.tailTransforms[i].position.x);
            tails.tails[i].transform.position = new UnityVector3(player.tailTransforms[i].position.x,
                player.tailTransforms[i].position.y, player.tailTransforms[i].position.z);
            
            tails.tails[i].transform.localRotation = Quaternion.Euler(this.ParseVector3(player.tailTransforms[i].rotation));
        }
    }
    private OnCatchStarEvent(instanceId: number, star: GameObject){
        if(!this.characterSessionIdMap.has(instanceId)){
            return;
        }
        const sessionId: string = this.characterSessionIdMap.get(instanceId);

        if(sessionId === this.room.SessionId){
            this.room.Send("onCatchStar", "");
            this.starObjectPool.ReturnObject(star);
        }
    }

    private OnHitByBombEvent(instanceId: number, bomb: GameObject){
        if(!this.characterSessionIdMap.has(instanceId)){
            return;
        }
        const sessionId: string = this.characterSessionIdMap.get(instanceId);

        if(sessionId === this.room.SessionId){
            this.room.Send("onHitByBomb", "");
        }
    }

    //trigger event 시 호출될 공격 함수
    private OnAttackEvent(ownerId: string){
        // if(!this.characterSessionIdMap.has(instanceId)){
        //     return;
        // }
        // const sessionId: string = this.characterSessionIdMap.get(instanceId);
        if(ownerId === this.room.SessionId){
            return;
        }

        if(this.attackAvailableMap.has(ownerId)){
            return;
        }

        let addTime = new Date();
        addTime.setSeconds(addTime.getSeconds() + 1);
        this.attackAvailableMap.set(ownerId, addTime);

        this.SendAttack(ownerId);
    }

    private SendAttack(targetSessionId: string){
        const data = new RoomData();

        data.Add("targetSessionId", targetSessionId);
        this.room.Send("onAttack", data.GetObject());
    }

    private SendTransform(transform: UnityEngine.Transform) {
        const data = new RoomData();

        const pos = new RoomData();
        pos.Add("x", transform.localPosition.x);
        pos.Add("y", transform.localPosition.y);
        pos.Add("z", transform.localPosition.z);
        data.Add("position", pos.GetObject());

        const rot = new RoomData();
        rot.Add("x", transform.localEulerAngles.x);
        rot.Add("y", transform.localEulerAngles.y);
        rot.Add("z", transform.localEulerAngles.z);
        data.Add("rotation", rot.GetObject());

        // const tails: PlayerTails = this.playerTailsDatas.get(this.room.SessionId);

        // const posArrData = new RoomData();

        // const posArr: TransformData[] = [];

        // for(let i = 0; i < tails.tails.length; i++){
        //     const tail = tails.tails[i];
            
        //     const pos1 = new RoomData();
        //     pos1.Add("x", tails.tails[i].transform.position.x);
        //     pos1.Add("y", tails.tails[i].transform.position.y);
        //     pos1.Add("z", tails.tails[i].transform.position.z);

        //     const rot1 = new RoomData();
        //     rot1.Add("x", tails.tails[i].transform.localEulerAngles.x);
        //     rot1.Add("y", tails.tails[i].transform.localEulerAngles.y);
        //     rot1.Add("z", tails.tails[i].transform.localEulerAngles.z);

        //     const transform: RoomData = new RoomData();
        //     transform.Add("position", pos1.GetObject());
        //     transform.Add("rotation", rot1.GetObject());

        //     posArrData.Add(i.toString(), transform.GetObject());
        // }

        // posArrData.Add("tailCount", tails.tails.length);
        
        // data.Add("tailTransforms", posArrData.GetObject());

        this.room.Send("onChangedTransform", data.GetObject());
    }

    private SendState(state: CharacterState) {
        const data = new RoomData();
        data.Add("state", state);
        this.room.Send("onChangedState", data.GetObject());
    }

    private ParseVector3(vector3: Vector): UnityEngine.Vector3 {
        return new UnityEngine.Vector3
            (
                vector3.x,
                vector3.y,
                vector3.z
            );
    }

    private ParseDateObject(dateObject: DateObject): Date{
        const date = new Date();
        date.setFullYear(dateObject.year);
        date.setMonth(dateObject.month);
        date.setDate(dateObject.date);
        date.setTime(dateObject.time);
        date.setMinutes(dateObject.minutes);
        date.setSeconds(dateObject.seconds);
        date.setMilliseconds(dateObject.milliseconds);

        return date;
    }
}