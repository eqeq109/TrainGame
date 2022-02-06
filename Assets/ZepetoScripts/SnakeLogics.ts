import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
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
    public tails: Array<GameObject> = new Array<GameObject>();;
    public markManagers: Array<MarkManager> = new Array<MarkManager>();;
    //public tailTransforms: Array<Transform> = new Array<Transform>();;
    
    constructor(){

    }
}