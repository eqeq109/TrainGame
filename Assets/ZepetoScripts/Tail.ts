import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

import { Collider, Collider2D, Collision, Collision2D, Coroutine, GameObject, Material, ParticleSystem, Renderer, Time, WaitForEndOfFrame } from 'UnityEngine';
import { ZepetoCharacter } from 'ZEPETO.Character.Controller';
import {Action$1} from 'System';
import { easing } from './EasingFunctions';

export default class Tail extends ZepetoScriptBehaviour {
    public isFirst: boolean = false;
    public ownerId: string;
    public triggerEvent: Function;//UnityEvent$1<string>;
    public returnObjectEvent: Function;
    public isLast: boolean = false;
    public headModel: GameObject;
    public tailModel: GameObject;
    public hitedRoutine: Coroutine;
    public blowRoutine: Coroutine;

    public blowEffect: ParticleSystem;
    
    Start() {    

    }

    public Init(id: string, first: boolean, event: Function, returnObject: Function){//UnityEvent$1<string> ){
        //console.log('init');
        this.triggerEvent = event;
        this.isLast = false;
        this.ownerId = id;
        this.headModel.SetActive(first);
        this.tailModel.SetActive(!first);
        this.isFirst = first;
        this.blowEffect.gameObject.SetActive(false);
        this.returnObjectEvent = returnObject;
    }

    private fullTime: float = 2;
    private partTime: float = 0.5;
    private * HitAnimation(){
        let playTime: float = 0;
        let partProcessTime: float = 0;
        const model: GameObject = this.isFirst ? this.headModel : this.tailModel;
        
        const material: Material = model.GetComponent<Renderer>().material;
        
        while(true){
            yield new WaitForEndOfFrame();
            playTime += Time.deltaTime;

            if(partProcessTime <= this.partTime){
                partProcessTime += Time.deltaTime;

                material.SetFloat('_Alpha', easing.inCirc2(1, 0, partProcessTime / this.partTime));
            }
            else if (partProcessTime <= 1){
                partProcessTime += Time.deltaTime;

                material.SetFloat('_Alpha', easing.inCirc2(0, 1, (partProcessTime - 0.5) / this.partTime));
            }else{
                partProcessTime = 0;
            }
            if(playTime > this.fullTime){
                material.SetFloat('_Alpha', 1);
                break;
            }
        }
        yield null;
    }
    private blowPartTime: float = 0.5;
    private * BlowAnimation(){
        let playTime: float = 0;
        this.blowEffect.gameObject.SetActive(true);
        this.isFirst ? this.headModel.SetActive(false): this.tailModel.SetActive(false);
        
        this.blowEffect.Play();
        while(playTime <= this.blowPartTime){
            yield new WaitForEndOfFrame();
            playTime += Time.deltaTime;
        }
        this.blowEffect.gameObject.SetActive(false);
        this.returnObjectEvent(this.gameObject);
    }

    public SetLast(last: boolean){
        this.isLast = last;
    }
    public PlayHitAnimation(){
        if(this.hitedRoutine){
            this.StopCoroutine(this.hitedRoutine);
        }
        this.hitedRoutine = this.StartCoroutine(this.HitAnimation());
    }
    public PlayBlowAnimation(){
        if(this.blowRoutine){
            this.StopCoroutine(this.blowRoutine);
        }
        this.blowRoutine = this.StartCoroutine(this.BlowAnimation());
    }

    OnTriggerEnter(coll: Collider) {
        if(!this.ownerId){
            return;
        }
        if(!coll.gameObject.GetComponent<ZepetoCharacter>()){
            //console.log(`not have zepetocharacter ${coll.gameObject.name}.`);
            return;
        }
        if (!this.isLast) {
            return;
        }
        if (this.triggerEvent != null) {
            this.triggerEvent(this.ownerId);
            //this.triggerEvent.Invoke(this.ownerId);
        }
    }

}