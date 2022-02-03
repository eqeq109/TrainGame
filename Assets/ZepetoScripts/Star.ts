import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

import * as UnityEngine from "UnityEngine";
import { GameObject, Vector3 as UnityVector3, Object, Transform, Time, Mathf, Quaternion, BoxCollider, Rigidbody, FixedJoint } from 'UnityEngine'

export default class Star extends ZepetoScriptBehaviour {
    public starTransform: Transform;
    Start() {    
        this.StartCoroutine(this.RotateStar(1 / 60));
    }


    private * RotateStar(tick: number) {
        while (true) {
            yield new UnityEngine.WaitForSeconds(tick);
            this.starTransform.Rotate(UnityVector3.up);
            
        }
    }
}