import {ZepetoScriptBehaviour} from 'ZEPETO.Script'
import {ZepetoWorldMultiplay} from 'ZEPETO.World'
import {Room, RoomData} from 'ZEPETO.Multiplay'
import {Player, State, Vector} from 'ZEPETO.Multiplay.Schema'
import {CharacterState, SpawnInfo, ZepetoPlayers, ZepetoPlayer} from 'ZEPETO.Character.Controller'
import * as UnityEngine from "UnityEngine";
import { GameObject, Vector3 as UnityVector3, Object, Transform, Time, Mathf, Quaternion, BoxCollider, Rigidbody} from 'UnityEngine'

class Mark{
    public Position: UnityVector3;
    public Rotation: Quaternion;

    constructor(pos: UnityVector3, rot: Quaternion){
        this.Position = pos;
        this.Rotation = rot;
    }
}

class MarkManager{
    public MarkList: Array<Mark> = new Array<Mark>();


    public UpdateMarkList(pos: UnityVector3, rot: Quaternion){
        this.MarkList.push(new Mark(pos, rot));
    }

    public ClearMarkList(pos: UnityVector3, rot: Quaternion){
        this.MarkList = [];
        this.MarkList.push(new Mark(pos, rot));
    }
}

export default class Starter extends ZepetoScriptBehaviour {

    public multiplay: ZepetoWorldMultiplay;

    private room: Room;
    private currentPlayers: Map<string, Player> = new Map<string, Player>();
    public tailPrefab: GameObject;

    private tails: Array<GameObject> = new Array<GameObject>();
    private tailTransforms: Array<Transform> = new Array<Transform>(); 

    private markManagers: Array<MarkManager> = new Array<MarkManager>();

    private Start() {

        this.multiplay.RoomCreated += (room: Room) => {
            this.room = room;
        };

        this.multiplay.RoomJoined += (room: Room) => {
            room.OnStateChange += this.OnStateChange;
        };

        

        for(let i = 0; i < 3; i++){
            let train: GameObject = GameObject.Instantiate<GameObject>(this.tailPrefab);
            this.tails.push(train);
            this.tailTransforms.push(train.transform);

            this.markManagers.push(new MarkManager());
            //this.tailTransforms[i] = this.tails[i].GetComponent<Transform>();
        }

        this.StartCoroutine(this.SendMessageLoop(0.1));
        this.StartCoroutine(this.UpdateLoop(0.25));
    }

    // 일정 Interval Time으로 내(local)캐릭터 transform을 server로 전송합니다.
    private* SendMessageLoop(tick: number) {
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

    private* UpdateLoop(tick: number) {
        while (true) {
            yield new UnityEngine.WaitForSeconds(tick);

            if (this.room != null && this.room.IsConnected) {
                const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.room.SessionId);{
                    if(hasPlayer){
                        const myPlayer = ZepetoPlayers.instance.GetPlayer(this.room.SessionId);
                        
                    }
                }
            }
        }
    }
    private InitTailTransform(){
        const myPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;

        const direction = new UnityVector3(myPlayer.character.transform.forward.x * -1, myPlayer.character.transform.forward.y * -1, myPlayer.character.transform.forward.z * -1);

        for(let i = 1; i <= 3; i++){
            const trainPos = new UnityVector3(myPlayer.character.transform.position.x + (direction.x * (0.8 * i)), myPlayer.character.transform.position.y + (direction.y * (0.8 * i)), myPlayer.character.transform.position.z + (direction.z * (0.8 * i)));

            this.tailTransforms[i].position = trainPos;
        }
    }

    private SetTailTransform() {
        const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.room.SessionId);
                if (hasPlayer) {
                    const myPlayer = ZepetoPlayers.instance.GetPlayer(this.room.SessionId);
                    // let direction = new UnityVector3(myPlayer.character.transform.forward.x * -1, myPlayer.character.transform.forward.y * -1, myPlayer.character.transform.forward.z * -1);
                    // //let direction = new UnityVector3(myPlayer.character.transform.rotation.eulerAngles.normalized.x * -1, myPlayer.character.transform.rotation.eulerAngles.normalized.y * -1, myPlayer.character.transform.rotation.eulerAngles.normalized.z * -1);
                    // let trainPos1 = new UnityVector3(myPlayer.character.transform.position.x + (direction.x), myPlayer.character.transform.position.y + (direction.y), myPlayer.character.transform.position.z + (direction.z));
                    // let trainPos2 = new UnityVector3(myPlayer.character.transform.position.x + (direction.x * 1.5), myPlayer.character.transform.position.y + (direction.y * 1.5), myPlayer.character.transform.position.z + (direction.z * 1.5));
                    // let trainPos3 = new UnityVector3(myPlayer.character.transform.position.x + (direction.x * 2), myPlayer.character.transform.position.y + (direction.y * 2), myPlayer.character.transform.position.z + (direction.z * 2));
                    // this.tailTransforms[0].position = UnityVector3.Lerp(this.tailTransforms[0].position, trainPos1, myPlayer.character.RunSpeed * Time.deltaTime);
                    // this.tailTransforms[0].rotation = Quaternion.Lerp(this.tailTransforms[0].rotation, myPlayer.character.transform.rotation, myPlayer.character.RunSpeed * Time.deltaTime);

                    // this.tailTransforms[1].position = UnityVector3.Lerp(this.tailTransforms[1].position, trainPos2, myPlayer.character.RunSpeed * Time.deltaTime);
                    // this.tailTransforms[1].rotation = Quaternion.Lerp(this.tailTransforms[1].rotation, myPlayer.character.transform.rotation, myPlayer.character.RunSpeed * Time.deltaTime);

                    // this.tailTransforms[2].position = UnityVector3.Lerp(this.tailTransforms[2].position, trainPos3, myPlayer.character.RunSpeed * Time.deltaTime);
                    // this.tailTransforms[2].rotation = Quaternion.Lerp(this.tailTransforms[2].rotation, myPlayer.character.transform.rotation, myPlayer.character.RunSpeed * Time.deltaTime);
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