import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Color, Gizmos, Vector3 } from 'UnityEngine'



export default class SpawnZone extends ZepetoScriptBehaviour {

    Start() {    
        
    }
    Update() {
        Gizmos.color = Color.red;
        Gizmos.DrawCube(this.transform.position, new Vector3(1,1,1));
    }

    OnGUI(){
        
    }

}