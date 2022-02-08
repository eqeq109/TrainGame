import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Vector3, Object, Transform, Time, Mathf, Quaternion, BoxCollider, Rigidbody, FixedJoint, Debug } from 'UnityEngine'
import { Collider, Collider2D, Collision, Collision2D } from 'UnityEngine';
import { UnityEvent$1 } from "UnityEngine.Events";
import { CharacterState, SpawnInfo, ZepetoPlayers, ZepetoPlayer, ZepetoCharacter } from 'ZEPETO.Character.Controller';
import {Action$1} from 'System';

export default class Tail extends ZepetoScriptBehaviour {
    public ownerId: string;
    public triggerEvent: Action$1<string>;//UnityEvent$1<string>;
    public isLast: boolean = false;
    
    Start() {    

    }

    public Init(id: string,event: Action$1<string>){//UnityEvent$1<string> ){
        //console.log('init');
        this.triggerEvent = event;
        this.isLast = false;
        this.ownerId = id;
    }

    public SetLast(last: boolean){
        this.isLast = last;
    }

    OnCollisionEnter(coll: Collider){
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