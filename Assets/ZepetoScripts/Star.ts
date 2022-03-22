import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

import * as UnityEngine from "UnityEngine";
import { GameObject, Vector3 as UnityVector3, Object, Transform, Time, Mathf, Quaternion, BoxCollider, Rigidbody, FixedJoint, WaitForEndOfFrame, Coroutine } from 'UnityEngine'
import { Collider} from 'UnityEngine';

export default class Star extends ZepetoScriptBehaviour {
    public starTransform: Transform;
    public triggerEvent:Function;//UnityEvent$1<string>;
    public set setTrigger(value: Function) {this.triggerEvent = value};
    public blowEffect: UnityEngine.ParticleSystem;
    public returnObjectEvent: Function;
    
    public blowRoutine: Coroutine;
    public model: GameObject;

    Start() {    
        //this.StartCoroutine(this.RotateStar(1 / 60));
    }
    Update() {
        this.model.transform.Rotate(UnityVector3.up);
    }

    public Init(event: Function, position: UnityVector3, returnObject: Function){//UnityEvent$1<string> ){
        this.triggerEvent = event;
        this.model.SetActive(true);
        //this.setTrigger(event);
        this.starTransform.position = position;
        this.returnObjectEvent = returnObject;
    }


    private * RotateStar(tick: number) {
        while (true) {
            yield new UnityEngine.WaitForSeconds(tick);
            this.starTransform.Rotate(UnityVector3.up);
            
        }
    }
    private blowPartTime: float = 0.5;
    private * BlowAnimation(){
        let playTime: float = 0;
        this.model.SetActive(false);
        this.blowEffect.gameObject.SetActive(true);
        this.blowEffect.Play();
        while(playTime <= this.blowPartTime){
            yield new WaitForEndOfFrame();
            playTime += Time.deltaTime;
        }
        this.blowEffect.gameObject.SetActive(false);
        this.returnObjectEvent(this.gameObject);
        yield null;
    }
    public PlayBlowAnimation(){
        if(this.blowRoutine){
            this.StopCoroutine(this.blowRoutine);
        }
        this.blowRoutine = this.StartCoroutine(this.BlowAnimation());
    }

    OnTriggerEnter(coll: Collider) {
        if (this.triggerEvent != null) {
            this.triggerEvent(coll.gameObject.GetInstanceID(), this.gameObject);
        }
    }
}