import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import * as UnityEngine from "UnityEngine";
import { GameObject, Vector3 as UnityVector3, Object, 
    Transform, Time, Mathf, Quaternion,
     BoxCollider, Rigidbody, FixedJoint, Projector } from 'UnityEngine'
import { Collider} from 'UnityEngine';
import {easing} from './EasingFunctions'
import { ZepetoCharacter } from 'ZEPETO.Character.Controller';

export default class Bomb extends ZepetoScriptBehaviour {
    
    public triggerEvent: Function;
    public returnEvent: Function;
    public indicatorFill: Projector;
    public objectBomb: Transform;
    public particleExplode: UnityEngine.ParticleSystem;


    private animationTime: number = 2;
    private animation: UnityEngine.Coroutine;
    private detectionAvailable: boolean = false;
    
    public set setTrigger(value: Function) {this.triggerEvent = value};
    

    public Init(event: Function, returnObject: Function, position: UnityVector3){
        this.triggerEvent = event;
        this.returnEvent = returnObject;
        if(this.animation != null) this.StopCoroutine(this.SetAnimation);
        this.objectBomb.transform.localPosition = new UnityEngine.Vector3(0, 20, 0);
        this.gameObject.transform.position = position;
        this.objectBomb.gameObject.SetActive(true);
        this.animation = this.StartCoroutine(this.SetAnimation());
    }

    private * SetAnimation() {
        let timer: float = 0;
        const indicatorMax: number = 2.5;
        const startPosition: UnityEngine.Vector3 = this.objectBomb.localPosition;

        while(timer < this.animationTime){
            timer += Time.deltaTime;
            let timeRatio: float = timer / this.animationTime;
            this.objectBomb.localPosition = new UnityEngine.Vector3(easing.inOutBounce(startPosition.x, 0, timeRatio),
            easing.inOutBounce(startPosition.y, 0, timeRatio),
            easing.inOutBounce(startPosition.z, 0, timeRatio));
            // this.objectBomb.localPosition = UnityEngine.Vector3.Lerp(startPosition, 
            //     UnityEngine.Vector3.zero, timeRatio);
            this.indicatorFill.orthographicSize = indicatorMax * timeRatio;
            yield null;
        }
        this.objectBomb.gameObject.SetActive(false);
        this.particleExplode.gameObject.SetActive(true);
        this.particleExplode.Play();
        timer = 0;
        this.detectionAvailable = true;
        yield new UnityEngine.WaitForSeconds(0.3);
        this.detectionAvailable = false;
        yield new UnityEngine.WaitForSeconds(0.7);
        this.particleExplode.gameObject.SetActive(false);
        this.returnEvent(this.gameObject);
        yield null;
    }

    Start() {    
    }

    OnTriggerStay(coll: Collider) {

        if (!this.detectionAvailable) return;
        if(!coll.gameObject.GetComponent<ZepetoCharacter>()){
            return;
        }
        if (this.triggerEvent != null) {
            console.log('detected');
            this.detectionAvailable = false;
            this.triggerEvent(coll.gameObject.GetInstanceID(), this.gameObject);
        }
    }

}