import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { WorldMultiplayChatContent, ZepetoWorldMultiplay } from 'ZEPETO.World'
import { Room, RoomData } from 'ZEPETO.Multiplay'
import { Player, State, Vector } from 'ZEPETO.Multiplay.Schema'
import { CharacterState, SpawnInfo, ZepetoPlayers, ZepetoPlayer } from 'ZEPETO.Character.Controller'
import * as UnityEngine from "UnityEngine";
import { GameObject, Vector3 as UnityVector3, Object, Transform, Time, Mathf, Quaternion, BoxCollider, Rigidbody, FixedJoint } from 'UnityEngine'

// 스네이크 위치 히스토리
export interface Mark {
    position: UnityVector3;
    rotation: Quaternion;
}

//히스토리 기록 객체
export class MarkManager {
    public markList: Array<Mark>;

    constructor() {
        this.markList = new Array<Mark>();
    }

    public UpdateMarkList(pos: UnityVector3, rot: Quaternion): void {
        this.markList.push({ position: pos, rotation: rot });
    }

    public ClearMarkList(pos: UnityVector3, rot: Quaternion): void {
        this.markList = [];
        this.markList.push({ position: pos, rotation: rot });
    }
}

//유저별 스네이크 객체
export class PlayerTails{
    public tails: Array<GameObject>;
    public markManagers: Array<MarkManager>;
    public tailTransforms: Array<Transform>;
    
    constructor(){
        this.tails = new Array<GameObject>();
        this.markManagers = new Array<MarkManager>();
        this.tailTransforms = new Array<Transform>();
    }
}

export default class Starter extends ZepetoScriptBehaviour {

    public multiplay: ZepetoWorldMultiplay;
    //기차 프리팹
    public tailPrefab: GameObject;
    //기차 물리 head
    public headPrefab: GameObject;

    private room: Room;
    private currentPlayers: Map<string, Player> = new Map<string, Player>();
    //유저별 스네이크 객체 맵
    private playerTailsDatas: Map<string, PlayerTails> = new Map<string, PlayerTails>();


    //꼬리 최대개수(기본값: 5)
    private tailLength: int = 5;
    //꼬리간 거리
    private distanceBetween: float = 0.7;
    //움직임 체크
    private moveCheck: float = 0.0001;
    //기존 위치 기록
    private checkPosition: UnityVector3 = new UnityVector3(0, 0, 0);

    private Start() {

        this.multiplay.RoomCreated += (room: Room) => {
            this.room = room;
        };

        this.multiplay.RoomJoined += (room: Room) => {
            room.OnStateChange += this.OnStateChange;
        };


        this.StartCoroutine(this.SendMessageLoop(1 / 60));
        this.StartCoroutine(this.UpdateSnakeMove(1 / 60));
    }

    //TODO: 꼬리 GameObject Pooling
    public InitPlayer(sessionId: string) {
        let tails: PlayerTails = new PlayerTails();

        

        for (let i = 0; i < this.tailLength; i++) {
            let train: GameObject = GameObject.Instantiate<GameObject>(this.tailPrefab);

            tails.tails.push(train);
            tails.tailTransforms.push(train.transform);
            tails.markManagers.push(new MarkManager());
        }

        this.playerTailsDatas.set(sessionId, tails);
    }

    // 일정 Interval Time으로 내(local)캐릭터 transform을 server로 전송합니다.
    private * SendMessageLoop(tick: number) {
        while (true) {
            yield new UnityEngine.WaitForSeconds(tick);

            if (this.room != null && this.room.IsConnected) {
                const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.room.SessionId);
                if (hasPlayer) {
                    const myPlayer = ZepetoPlayers.instance.GetPlayer(this.room.SessionId);
                    if (myPlayer.character.CurrentState != CharacterState.Idle)
                        this.SendTransform(myPlayer.character.transform);
                }
            }
        }
    }
    
    // 웁직임 체크
    private checkMove(curPos: UnityVector3): boolean {
        if (UnityVector3.Distance(curPos, this.checkPosition) > this.moveCheck)
            return true;

        return false;
    }

    //스네이크 로직 함수
    private UpdateTails(sessionId: string){
        const tails: PlayerTails = this.playerTailsDatas.get(sessionId);

        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);

        if (zepetoPlayer.character.CurrentState != CharacterState.Idle) {
            //if (this.checkMove(myPlayer.character.transform.position)) {
            UnityEngine.Debug.Log(zepetoPlayer.character.transform.position);
            //head
            tails.markManagers[0].UpdateMarkList(zepetoPlayer.character.transform.position, zepetoPlayer.character.transform.rotation);

            for (let i = 1; i < this.tailLength; i++) {
                const markManager: MarkManager = tails.markManagers[i];
                UnityEngine.Debug.Log(markManager);
                markManager.UpdateMarkList(tails.tailTransforms[i - 1].position, tails.tailTransforms[i - 1].rotation);
            }
            //if (this.checkMove(zepetoPlayer.character.transform.position)) {
                for (let i = 0; i < this.tailLength; i++) {
                    const markManager: MarkManager = tails.markManagers[i];
                    UnityEngine.Debug.Log(tails.tailTransforms[i].position);
                    
                    if (i == 0) {
                        if (UnityVector3.Distance(zepetoPlayer.character.transform.position, tails.tailTransforms[i].position) >= this.distanceBetween) {
                            while (UnityVector3.Distance(zepetoPlayer.character.transform.position, tails.tailTransforms[i].position) >= this.distanceBetween && markManager.markList.length > 0) {
                                tails.tailTransforms[i].position = UnityVector3.Lerp(tails.tailTransforms[i].position, markManager.markList[0].position, 100 * Time.deltaTime);
                                tails.tailTransforms[i].rotation = Quaternion.Lerp(tails.tailTransforms[i].rotation, markManager.markList[0].rotation, 100 * Time.deltaTime);
                                markManager.markList.shift();
                            }
                        }
                    }
                    else {
                        if (UnityVector3.Distance(tails.tailTransforms[i - 1].position, tails.tailTransforms[i].position) >= this.distanceBetween) {
                            while (UnityVector3.Distance(tails.tailTransforms[i - 1].position, tails.tailTransforms[i].position) >= this.distanceBetween && markManager.markList.length > 0) {
                                tails.tailTransforms[i].position = UnityVector3.Lerp(tails.tailTransforms[i].position, markManager.markList[0].position, 100 * Time.deltaTime);
                                tails.tailTransforms[i].rotation = Quaternion.Lerp(tails.tailTransforms[i].rotation, markManager.markList[0].rotation, 100 * Time.deltaTime);
                                markManager.markList.shift();
                            }
                        }
                    }

                }
            //}
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

    //TODO: 유저 접속 시 스폰 초기화
    private InitTailTransform(sessionId: string) {
        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);
        const tailData = this.playerTailsDatas.get(sessionId);

        const direction = new UnityVector3(zepetoPlayer.character.transform.forward.x * -1, zepetoPlayer.character.transform.forward.y * -1, zepetoPlayer.character.transform.forward.z * -1);

        for (let i = 1; i <= 3; i++) {
            const trainPos = new UnityVector3(zepetoPlayer.character.transform.position.x + (direction.x * (0.8 * i)), zepetoPlayer.character.transform.position.y + (direction.y * (0.8 * i)), zepetoPlayer.character.transform.position.z + (direction.z * (0.8 * i)));

            tailData.tailTransforms[i - 1].position = trainPos;
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
                if (!isLocal) {
                    const player: Player = this.currentPlayers.get(sessionId);

                    // [RoomState] player 인스턴스의 state가 갱신될 때마다 호출됩니다.
                    player.OnChange += (changeValues) => this.OnUpdatePlayer(sessionId, player);
                }
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
        
        this.InitPlayer(sessionId);

    }

    //TODO: 꼬리 GameObject Pooling
    private OnLeavePlayer(sessionId: string, player: Player) {
        console.log(`[OnRemove] players - sessionId : ${sessionId}`);
        this.currentPlayers.delete(sessionId);

        ZepetoPlayers.instance.RemovePlayer(sessionId);
    }

    // 필드 유저 업데이트
    private OnUpdatePlayer(sessionId: string, player: Player) {

        const position = this.ParseVector3(player.transform.position);

        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);
        zepetoPlayer.character.MoveToPosition(position);

        if (player.state === CharacterState.JumpIdle || player.state === CharacterState.JumpMove)
            zepetoPlayer.character.Jump();

        const tails: PlayerTails = this.playerTailsDatas.get(sessionId);

        this.UpdateTails(sessionId);

        
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
}