import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Color, Gizmos, Vector3 } from 'UnityEngine'
import { SpawnType } from './CommonTypes';



export default class SpawnZone extends ZepetoScriptBehaviour {
    public spawnType: SpawnType = SpawnType.star;
    public leftTop: Vector3;
    public leftBottom: Vector3;
    public rightTop: Vector3;
    public rightBottom: Vector3;


    public Init(type: SpawnType)
    {

    }
    Start() {    
        
    }
    Update() {
    }

    OnGUI(){
        
    }

}