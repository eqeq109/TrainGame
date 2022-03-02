import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

import * as UnityEngine from "UnityEngine";
import { GameObject, Vector3 as UnityVector3, Object, Transform, Time, Mathf, Quaternion, BoxCollider, Rigidbody, FixedJoint } from 'UnityEngine'
import { Collider} from 'UnityEngine';

export default class Star extends ZepetoScriptBehaviour {
    public starTransform: Transform;
    public triggerEvent:Function;//UnityEvent$1<string>;
    public set setTrigger(value: Function) {this.triggerEvent = value};

    Start() {    
        this.StartCoroutine(this.RotateStar(1 / 60));
    }

    public Init(event: Function, position: UnityVector3){//UnityEvent$1<string> ){
        this.triggerEvent = event;
        //this.setTrigger(event);
        this.starTransform.position = position;
    }


    private * RotateStar(tick: number) {
        while (true) {
            yield new UnityEngine.WaitForSeconds(tick);
            this.starTransform.Rotate(UnityVector3.up);
            
        }
    }

    OnTriggerEnter(coll: Collider) {
        if (this.triggerEvent != null) {
            this.triggerEvent(coll.gameObject.GetInstanceID(), this.gameObject);
        }
    }
}