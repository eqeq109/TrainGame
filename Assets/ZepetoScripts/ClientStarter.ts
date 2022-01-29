import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { WorldMultiplayChatContent, ZepetoWorldMultiplay } from 'ZEPETO.World'
import { Room, RoomData } from 'ZEPETO.Multiplay'
import { Player, State, Vector } from 'ZEPETO.Multiplay.Schema'
import { CharacterState, SpawnInfo, ZepetoPlayers, ZepetoPlayer } from 'ZEPETO.Character.Controller'
import * as UnityEngine from "UnityEngine";
import { GameObject, Vector3 as UnityVector3, Object, Transform, Time, Mathf, Quaternion, BoxCollider, Rigidbody } from 'UnityEngine'

export interface Mark {
    position: UnityVector3;
    rotation: Quaternion;
}

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

    private room: Room;
    private currentPlayers: Map<string, Player> = new Map<string, Player>();
    private playerTailsMap: Map<string, PlayerTails> = new Map<string, PlayerTails>();
    public tailPrefab: GameObject;

    private tails: Array<GameObject> = new Array<GameObject>();
    private tailTransforms: Array<Transform> = new Array<Transform>();

    private markManagers: Array<MarkManager> = new Array<MarkManager>();

    private tailLength: int = 3;
    private distanceBetween: float = 0.7;
    private moveCheck: float = 0.001;
    private checkPosition: UnityVector3 = new UnityVector3(0, 0, 0);

    private Start() {

        this.multiplay.RoomCreated += (room: Room) => {
            this.room = room;
        };

        this.multiplay.RoomJoined += (room: Room) => {
            room.OnStateChange += this.OnStateChange;
        };

        this.InitGame();

        this.StartCoroutine(this.SendMessageLoop(0.1));
        this.StartCoroutine(this.UpdateSnakeMove(1 / 60));
    }

    private InitGame() {
        for (let i = 0; i < this.tailLength; i++) {
            let train: GameObject = GameObject.Instantiate<GameObject>(this.tailPrefab);
            this.tails.push(train);
            this.tailTransforms.push(train.transform);

            this.markManagers.push(new MarkManager());
            UnityEngine.Debug.Log(i.toString() + "markManager" + this.markManagers[i]);
            //this.tailTransforms[i] = this.tails[i].GetComponent<Transform>();
        }
        UnityEngine.Debug.Log(this.markManagers.length);

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
    private checkMove(curPos: UnityVector3): boolean {
        if (UnityVector3.Distance(curPos, this.checkPosition) > this.moveCheck)
            return true;

        return false;
    }

    private * UpdateSnakeMove(tick: number) {
        while (true) {
            yield new UnityEngine.WaitForSeconds(tick);

            if (this.room != null && this.room.IsConnected) {
                const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.room.SessionId); {
                    if (hasPlayer) {
                        const myPlayer = ZepetoPlayers.instance.GetPlayer(this.room.SessionId);
                        if (myPlayer.character.CurrentState != CharacterState.Idle) {
                            //if (this.checkMove(myPlayer.character.transform.position)) {
                            UnityEngine.Debug.Log(myPlayer.character.transform.position);
                            //head
                            this.markManagers[0].UpdateMarkList(myPlayer.character.transform.position, myPlayer.character.transform.rotation);

                            for (let i = 1; i < this.tailLength; i++) {
                                const markManager: MarkManager = this.markManagers[i];
                                UnityEngine.Debug.Log(markManager);
                                markManager.UpdateMarkList(this.tailTransforms[i - 1].position, this.tailTransforms[i - 1].rotation);
                            }
                            if (this.checkMove(myPlayer.character.transform.position)) {
                                for (let i = 0; i < this.tailLength; i++) {
                                    const markManager: MarkManager = this.markManagers[i];
                                    UnityEngine.Debug.Log(this.tailTransforms[i].position);
                                    
                                    if (i == 0) {
                                        if (UnityVector3.Distance(myPlayer.character.transform.position, this.tailTransforms[i].position) >= this.distanceBetween) {
                                            while (UnityVector3.Distance(myPlayer.character.transform.position, this.tailTransforms[i].position) >= this.distanceBetween && markManager.markList.length > 0) {
                                                this.tailTransforms[i].position = UnityVector3.Lerp(this.tailTransforms[i].position, markManager.markList[0].position, 100 * Time.deltaTime);
                                                this.tailTransforms[i].rotation = Quaternion.Lerp(this.tailTransforms[i].rotation, markManager.markList[0].rotation, 100 * Time.deltaTime);
                                                markManager.markList.shift();
                                            }
                                        }
                                    }
                                    else {
                                        if (UnityVector3.Distance(this.tailTransforms[i - 1].position, this.tailTransforms[i].position) >= this.distanceBetween) {
                                            while (UnityVector3.Distance(this.tailTransforms[i - 1].position, this.tailTransforms[i].position) >= this.distanceBetween && markManager.markList.length > 0) {
                                                this.tailTransforms[i].position = UnityVector3.Lerp(this.tailTransforms[i].position, markManager.markList[0].position, 100 * Time.deltaTime);
                                                this.tailTransforms[i].rotation = Quaternion.Lerp(this.tailTransforms[i].rotation, markManager.markList[0].rotation, 100 * Time.deltaTime);
                                                markManager.markList.shift();
                                            }
                                        }
                                    }

                                }
                            }
                        }
                    }
                }
            }
        }
    }
    private InitTailTransform() {
        const myPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;

        const direction = new UnityVector3(myPlayer.character.transform.forward.x * -1, myPlayer.character.transform.forward.y * -1, myPlayer.character.transform.forward.z * -1);

        for (let i = 1; i <= 3; i++) {
            const trainPos = new UnityVector3(myPlayer.character.transform.position.x + (direction.x * (0.8 * i)), myPlayer.character.transform.position.y + (direction.y * (0.8 * i)), myPlayer.character.transform.position.z + (direction.z * (0.8 * i)));

            this.tailTransforms[i - 1].position = trainPos;
        }
    }

    private OnStateChange(state: State, isFirst: boolean) {

        // 첫 OnStateChange 이벤트 수신 시, State 전체 스냅샷을 수신합니다.
        if (isFirst) {

            // [CharacterController] (Local)Player 인스턴스가 Scene에 완전히 로드되었을 때 호출
            ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
                const myPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;
                this.InitTailTransform();
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
        
        if (!isLocal) {
            let tails: PlayerTails = new PlayerTails();


            for (let i = 0; i < this.tailLength; i++) {
                let train: GameObject = GameObject.Instantiate<GameObject>(this.tailPrefab);

                tails.tails.push(train);
                tails.tailTransforms.push(train.transform);
                tails.markManagers.push(new MarkManager());

                //this.tails.push(train);
                //this.tailTransforms.push(train.transform);

                //this.markManagers.push(new MarkManager());
                //this.tailTransforms[i] = this.tails[i].GetComponent<Transform>();
            }

            this.playerTailsMap.set(sessionId, tails);
        }
    }

    private OnLeavePlayer(sessionId: string, player: Player) {
        console.log(`[OnRemove] players - sessionId : ${sessionId}`);
        this.currentPlayers.delete(sessionId);

        ZepetoPlayers.instance.RemovePlayer(sessionId);
    }

    private OnUpdatePlayer(sessionId: string, player: Player) {

        const position = this.ParseVector3(player.transform.position);

        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);
        zepetoPlayer.character.MoveToPosition(position);

        if (player.state === CharacterState.JumpIdle || player.state === CharacterState.JumpMove)
            zepetoPlayer.character.Jump();

        const tails: PlayerTails = this.playerTailsMap.get(sessionId);

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
            if (this.checkMove(zepetoPlayer.character.transform.position)) {
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
            }
        }
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