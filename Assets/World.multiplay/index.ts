import { Sandbox, SandboxOptions, SandboxPlayer } from "ZEPETO.Multiplay";
import { DataStorage } from "ZEPETO.Multiplay.DataStorage";
import { Player, Transform, Vector, DateObject } from "ZEPETO.Multiplay.Schema";
const maxExp: number = 5;

// interface AvailableTimeObject{
//     sessionId: string,
//     availableTime: Date,
// }

export interface LevelData {
  level: number;
  requireScore: number;
  accumulateScore: number;
}

export const ExpTable: LevelData[] = [
  { level: 2, requireScore: 2, accumulateScore: 2 },
  { level: 3, requireScore: 2, accumulateScore: 4 },
  { level: 4, requireScore: 2, accumulateScore: 6 },
  { level: 5, requireScore: 2, accumulateScore: 8 },
  { level: 6, requireScore: 2, accumulateScore: 10 },
  { level: 7, requireScore: 3, accumulateScore: 13 },
  { level: 8, requireScore: 3, accumulateScore: 16 },
  { level: 9, requireScore: 3, accumulateScore: 19 },
  { level: 10, requireScore: 3, accumulateScore: 22 },
  { level: 11, requireScore: 3, accumulateScore: 25 },
  { level: 12, requireScore: 5, accumulateScore: 30 },
  { level: 13, requireScore: 5, accumulateScore: 35 },
  { level: 14, requireScore: 5, accumulateScore: 40 },
  { level: 15, requireScore: 5, accumulateScore: 45 },
  { level: 16, requireScore: 5, accumulateScore: 50 },
  { level: 17, requireScore: 8, accumulateScore: 58 },
  { level: 18, requireScore: 8, accumulateScore: 66 },
  { level: 19, requireScore: 8, accumulateScore: 74 },
  { level: 20, requireScore: 8, accumulateScore: 82 },
  { level: 21, requireScore: 8, accumulateScore: 90 },
  { level: 22, requireScore: 16, accumulateScore: 106 },
  { level: 23, requireScore: 16, accumulateScore: 122 },
  { level: 24, requireScore: 16, accumulateScore: 138 },
  { level: 25, requireScore: 16, accumulateScore: 155 },
];

export interface TrainCountData {
  count: number;
  requireScore: number;
  accumulateScore: number;
}

export const TrainCountTable: TrainCountData[] = [
  { count: 2, requireScore: 10, accumulateScore: 10 },
  { count: 3, requireScore: 15, accumulateScore: 25 },
  { count: 4, requireScore: 25, accumulateScore: 50 },
  { count: 5, requireScore: 40, accumulateScore: 90 },
];

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

      // player.tailTransforms.clear();

      // for(let i = 0; i < message.tailTransforms.tailCount; i++){
      //     //console.log(`[tailPos] x : ${message.tailTransforms[i].position.x},
      //     //y : ${message.tailTransforms[i].position.y}, z : ${message.tailTransforms[i].position.z}`);

      //     const tailTransform = new Transform();
      //     tailTransform.position.x = message.tailTransforms[i].position.x;
      //     tailTransform.position.y = message.tailTransforms[i].position.y;
      //     tailTransform.position.z = message.tailTransforms[i].position.z;

      //     tailTransform.rotation.x = message.tailTransforms[i].rotation.x;
      //     tailTransform.rotation.y = message.tailTransforms[i].rotation.y;
      //     tailTransform.rotation.z = message.tailTransforms[i].rotation.z;

      //     player.tailTransforms.push(tailTransform);
      // }
    });

    this.onMessage("onGameStart", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      player.spawnState = 1;
      console.log("gameStart");
    });

    this.onMessage("onGameRestart", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      player.exp = 0;
      player.spawnState = 1;
      console.log("restart");
    });

    this.onMessage("onChangedState", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      player.state = message.state;
    });

    //데미지 처리
    this.onMessage("onAttack", (client, message) => {
      const atkSessionId = client.sessionId;
      const targetSessionId = message.targetSessionId;

      const atkPlayer: Player = this.state.players.get(atkSessionId);

      const targetPlayer: Player = this.state.players.get(targetSessionId);

      //피격 유저 처리
      if (targetPlayer.exp <= 0) {
        //TODO: Game over
        targetPlayer.spawnState = 0;
      } else {
        targetPlayer.exp = targetPlayer.exp - 1;
      }

      //공격 유저 처리
      if (atkPlayer.exp < maxExp) {
        atkPlayer.exp = atkPlayer.exp + 1;
      }

      const availableTime = new Date();
      availableTime.setSeconds(availableTime.getSeconds() + 2);
      const dateData = new DateObject();
      dateData.year = availableTime.getFullYear();
      dateData.month = availableTime.getMonth();
      dateData.date = availableTime.getDate();
      dateData.time = availableTime.getTime();
      dateData.minutes = availableTime.getMinutes();
      dateData.seconds = availableTime.getSeconds();
      dateData.milliseconds = availableTime.getMilliseconds();
      targetPlayer.atkAvailable = dateData; // availableTime;

      console.log(
        `[OnAttack] sessionId : ${atkSessionId}, exp : ${atkPlayer.exp}`
      );
      console.log(
        `[OnTarget] sessionId : ${targetSessionId}, exp : ${targetPlayer.exp}`
      );
    });

    this.onMessage("onCatchStar", (client, message) => {
      const player: Player = this.state.players.get(client.sessionId);

      //별 먹음 처리
      if (player.exp < maxExp) {
        player.exp = player.exp + 1;
      }
    });

    this.onMessage("onHitByBomb", (client, message) => {
      const player: Player = this.state.players.get(client.sessionId);

      //폭탄 피격 처리
      if (player.exp > 0) {
        player.exp = player.exp - 1;
      } else if (player.exp <= 0) {
        player.spawnState = 0;
      }

      const availableTime = new Date();
      availableTime.setSeconds(availableTime.getSeconds() + 2);
      const dateData = new DateObject();
      dateData.year = availableTime.getFullYear();
      dateData.month = availableTime.getMonth();
      dateData.date = availableTime.getDate();
      dateData.time = availableTime.getTime();
      dateData.minutes = availableTime.getMinutes();
      dateData.seconds = availableTime.getSeconds();
      dateData.milliseconds = availableTime.getMilliseconds();
      player.atkAvailable = dateData; // availableTime;
    });
  }

  async onJoin(client: SandboxPlayer) {
    // schemas.json 에서 정의한 player 객체를 생성 후 초기값 설정.
    console.log(
      `[OnJoin] sessionId : ${client.sessionId}, HashCode : ${client.hashCode}, userId : ${client.userId}`
    );

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

    let visit_cnt = (await storage.get("VisitCount")) as number;
    if (visit_cnt == null) visit_cnt = 0;

    console.log(`[OnJoin] ${client.sessionId}'s visiting count : ${visit_cnt}`);

    // [DataStorage] Player의 방문 횟수를 갱신한다음 Storage Save
    await storage.set("VisitCount", ++visit_cnt);
    //최초 스탯 세팅
    let exp = (await storage.get("exp")) as number;
    if (exp == null) exp = 0;
    await storage.set("exp", exp);
    player.exp = exp;

    const transform = new Transform();
    transform.position = new Vector();
    transform.position.x = this.getRandomArbitrary(-34, 31); //message.position.x;
    transform.position.y = 0;
    transform.position.z = this.getRandomArbitrary(-23, 7);

    transform.rotation = new Vector();
    transform.rotation.x = 0;
    transform.rotation.y = 0;
    transform.rotation.z = 0;

    player.transform = transform;

    const availableTime = new Date();
    availableTime.setSeconds(availableTime.getSeconds() + 2);
    const dateData = new DateObject();
    dateData.year = availableTime.getFullYear();
    dateData.month = availableTime.getMonth();
    dateData.date = availableTime.getDate();
    dateData.time = availableTime.getTime();
    dateData.minutes = availableTime.getMinutes();
    dateData.seconds = availableTime.getSeconds();
    dateData.milliseconds = availableTime.getMilliseconds();
    player.atkAvailable = dateData; // availableTime;

    player.tailTransforms.clear();
    player.spawnState = 0;

    for (let i = 0; i < player.exp + 1; i++) {
      const tailTransform = new Transform();
      tailTransform.position.x = player.transform.position.x;
      tailTransform.position.y = player.transform.position.y;
      tailTransform.position.z = player.transform.position.z;

      tailTransform.rotation.x = player.transform.rotation.x;
      tailTransform.rotation.y = player.transform.rotation.y;
      tailTransform.rotation.z = player.transform.rotation.z;

      player.tailTransforms.push(tailTransform);
    }

    //let attackDamage = await storage.get("attackDamage");

    // client 객체의 고유 키값인 sessionId 를 사용해서 Player 객체를 관리.
    // set 으로 추가된 player 객체에 대한 정보를 클라이언트에서는 players 객체에 add_OnAdd 이벤트를 추가하여 확인 할 수 있음.
    this.state.players.set(client.sessionId, player);
  }

  getRandomArbitrary(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }
  private starSpawnCheck: number = 0;
  private bombSpawnCheck: number = 0;
  private starSpawnTime: number = 3000;
  private bombSpawnTime: number = 5000;

  onTick(deltaTime: number): void {
    //  서버에서 설정된 타임마다 반복적으로 호출되며 deltaTime 을 이용하여 일정한 interval 이벤트를 관리할 수 있음.
    this.starSpawnCheck += deltaTime;
    this.bombSpawnCheck += deltaTime;

    if (this.starSpawnCheck >= this.starSpawnTime) {
      this.SpawnStar();
      this.starSpawnCheck = 0;
    }
    if (this.bombSpawnCheck >= this.bombSpawnTime) {
      this.SpawnBomb();
      this.bombSpawnCheck = 0;
    }
  }

  private SpawnBomb = (): void => {
    const transform = new Transform();
    transform.position = new Vector();
    transform.position.x = this.getRandomArbitrary(-34, 31); //message.position.x;
    transform.position.y = 0;
    transform.position.z = this.getRandomArbitrary(-23, 7);

    transform.rotation = new Vector();
    transform.rotation.x = 0;
    transform.rotation.y = 0;
    transform.rotation.z = 0;

    this.broadcast("SpawnBomb", transform);
    console.log("SpawnBomb");
  };
  private SpawnStar = (): void => {
    const transform = new Transform();
    transform.position = new Vector();
    transform.position.x = this.getRandomArbitrary(-34, 31); //message.position.x;
    transform.position.y = 0;
    transform.position.z = this.getRandomArbitrary(-23, 7);

    transform.rotation = new Vector();
    transform.rotation.x = 0;
    transform.rotation.y = 0;
    transform.rotation.z = 0;

    this.broadcast("SpawnStar", transform);
    console.log("SpawnStar");
  };

  async onLeave(client: SandboxPlayer, consented?: boolean) {
    // allowReconnection 설정을 통해 순단에 대한 connection 유지 처리등을 할 수 있으나 기본 가이드에서는 즉시 정리.
    // delete 된 player 객체에 대한 정보를 클라이언트에서는 players 객체에 add_OnRemove 이벤트를 추가하여 확인 할 수 있음.
    this.state.players.delete(client.sessionId);
  }
}
