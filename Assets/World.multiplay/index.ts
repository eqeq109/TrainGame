import {Sandbox, SandboxOptions, SandboxPlayer} from "ZEPETO.Multiplay";
import {DataStorage} from "ZEPETO.Multiplay.DataStorage";
import {Player, Transform, Vector, DateObject} from "ZEPETO.Multiplay.Schema";

const maxExp: number = 6;

// interface AvailableTimeObject{
//     sessionId: string,
//     availableTime: Date,
// }

export default class extends Sandbox {
    //private starList: Array<Vector>;

    constructor() {
        super();
    }

    onCreate(options: SandboxOptions) {

        // Room 객체가 생성될 때 호출됩니다.
        // Room 객체의 상태나 데이터 초기화를 처리 한다.

        this.onMessage("onChangedTransform", (client, message) => {
            const player = this.state.players.get(client.sessionId);

            const transform = new Transform();
            transform.position = new Vector();
            transform.position.x = message.position.x;
            transform.position.y = message.position.y;
            transform.position.z = message.position.z;

            transform.rotation = new Vector();
            transform.rotation.x = message.rotation.x;
            transform.rotation.y = message.rotation.y;
            transform.rotation.z = message.rotation.z;

            player.transform = transform;
        });

        this.onMessage("onChangedState", (client, message) => { 
            const player = this.state.players.get(client.sessionId);
            player.state = message.state;
        });

        this.onMessage("onAttack", (client, message) =>{

        const atkSessionId = client.sessionId;
        const targetSessionId = message.targetSessionId;
            
        const atkPlayer: Player = this.state.players.get(atkSessionId);
        
        const targetPlayer: Player = this.state.players.get(targetSessionId);
        
        //피격 유저 처리
        

        if(targetPlayer.exp <= 1){
            //TODO: Game over
        }
        else
        {
            const changeExp = targetPlayer.exp - 1//atkPlayer.atkDamage;
            targetPlayer.exp = changeExp;
            // const targetClient = this.clients.find(t => t.sessionId === targetSessionId);
            // const storage: DataStorage = targetClient.loadDataStorage(); //client.loadDataStorage();

            // storage.set("exp", targetPlayer.exp);
        }


        //공격 유저 처리
        if(atkPlayer.exp < maxExp){
            const addExp = atkPlayer.exp + 1;
            atkPlayer.exp = addExp;
            // const atkClient = this.clients.find(t => t.sessionId === atkSessionId);
            // const storage: DataStorage = atkClient.loadDataStorage(); //client.loadDataStorage();

            // storage.set("exp", atkPlayer.exp);
        }

        const availableTime = new Date();
        availableTime.setSeconds(availableTime.getSeconds() + 1);
        const dateData = new DateObject();
        dateData.year = availableTime.getFullYear();
        dateData.month = availableTime.getMonth();
        dateData.date = availableTime.getDate();
        dateData.time = availableTime.getTime();
        dateData.minutes = availableTime.getMinutes();
        dateData.seconds = availableTime.getSeconds();
        dateData.milliseconds = availableTime.getMilliseconds();
        targetPlayer.atkAvailable = dateData;// availableTime;

        console.log(`[OnAttack] sessionId : ${atkSessionId}, exp : ${atkPlayer.exp}`);
        console.log(`[OnTarget] sessionId : ${targetSessionId}, exp : ${targetPlayer.exp}`);
            //this.onAttack(client.sessionId, message.targetSessionId);
        });
    }
    //데미지 처리
    onAttack(atkSessionId: string, targetSessionId: string){


        const atkPlayer: Player = this.state.players.get(atkSessionId);
        
        const targetPlayer: Player = this.state.players.get(targetSessionId);
        
        //피격 유저 처리
        const changeExp = targetPlayer.exp - 1//atkPlayer.atkDamage;

        if(changeExp <= 0){
            //TODO: Game over
        }
        else if(changeExp > maxExp){
            
        }
        else
        {
            targetPlayer.exp = changeExp;
            // const targetClient = this.clients.find(t => t.sessionId === targetSessionId);
            // const storage: DataStorage = targetClient.loadDataStorage(); //client.loadDataStorage();

            // storage.set("exp", targetPlayer.exp);
        }


        //공격 유저 처리
        if(atkPlayer.exp < maxExp){
            const addExp = atkPlayer.exp + 1;
            atkPlayer.exp = addExp;
            // const atkClient = this.clients.find(t => t.sessionId === atkSessionId);
            // const storage: DataStorage = atkClient.loadDataStorage(); //client.loadDataStorage();

            // storage.set("exp", atkPlayer.exp);
        }

        const availableTime = new Date();
        availableTime.setSeconds(availableTime.getSeconds() + 1);
        const dateData = new DateObject();
        dateData.year = availableTime.getFullYear();
        dateData.month = availableTime.getMonth();
        dateData.date = availableTime.getDate();
        dateData.time = availableTime.getTime();
        dateData.minutes = availableTime.getMinutes();
        dateData.seconds = availableTime.getSeconds();
        dateData.milliseconds = availableTime.getMilliseconds();
        targetPlayer.atkAvailable = dateData;// availableTime;

        console.log(`[OnAttack] sessionId : ${atkSessionId}, exp : ${atkPlayer.exp}`);
        console.log(`[OnTarget] sessionId : ${targetSessionId}, exp : ${targetPlayer.exp}`);

        // let data: AvailableTimeObject = {
        //     sessionId: targetSessionId,
        //     availableTime: availableTime,
        // };
        
        //this.broadcast("SetAvailableTime", data);

    }
    

    async onJoin(client: SandboxPlayer) {

        // schemas.json 에서 정의한 player 객체를 생성 후 초기값 설정.
        console.log(`[OnJoin] sessionId : ${client.sessionId}, HashCode : ${client.hashCode}, userId : ${client.userId}`)

        const player = new Player();
        player.sessionId = client.sessionId;

        if (client.hashCode) {
            player.zepetoHash = client.hashCode;
        }
        if (client.userId) {
            player.zepetoUserId = client.userId;
        }

        // [DataStorage] 입장한 Player의 DataStorage Load
        const storage: DataStorage = client.loadDataStorage();

        let visit_cnt = await storage.get("VisitCount") as number;
        if (visit_cnt == null) visit_cnt = 0;

        console.log(`[OnJoin] ${client.sessionId}'s visiting count : ${visit_cnt}`)

        // [DataStorage] Player의 방문 횟수를 갱신한다음 Storage Save
        await storage.set("VisitCount", ++visit_cnt);
        //최초 스탯 세팅
        let exp = await storage.get("exp") as number;
        if(exp == null) exp = 0;
        await storage.set("exp", exp);
        player.exp = exp;
        
        //let attackDamage = await storage.get("attackDamage");

        // client 객체의 고유 키값인 sessionId 를 사용해서 Player 객체를 관리.
        // set 으로 추가된 player 객체에 대한 정보를 클라이언트에서는 players 객체에 add_OnAdd 이벤트를 추가하여 확인 할 수 있음.
        this.state.players.set(client.sessionId, player);
    }

    onTick(deltaTime: number): void {
        //  서버에서 설정된 타임마다 반복적으로 호출되며 deltaTime 을 이용하여 일정한 interval 이벤트를 관리할 수 있음.
    }

    async onLeave(client: SandboxPlayer, consented?: boolean) {

        // allowReconnection 설정을 통해 순단에 대한 connection 유지 처리등을 할 수 있으나 기본 가이드에서는 즉시 정리.
        // delete 된 player 객체에 대한 정보를 클라이언트에서는 players 객체에 add_OnRemove 이벤트를 추가하여 확인 할 수 있음.
        this.state.players.delete(client.sessionId);
    }
}