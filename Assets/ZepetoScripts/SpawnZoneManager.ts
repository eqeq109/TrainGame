import { textSpanIntersectsWithTextSpan } from 'typescript'
import { Random, Vector3 } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import SpawnZone from './SpawnZone';
import { SpawnType } from './CommonTypes';

export default class SpawnZoneManager extends ZepetoScriptBehaviour {
    public spawnZones: SpawnZone[] = [];
    Start() {    
        for(let i = 0; i < this.transform.childCount; i++){
            let zone: SpawnZone = this.transform.GetChild(i).GetComponent<SpawnZone>();
            this.spawnZones.push(zone);
        }
    }


    public GetSpawnPos(seed: number, spawnType: SpawnType): Vector3 {
        const availableZones: SpawnZone[] = [];

        this.spawnZones.forEach((zone: SpawnZone) => {
            if(zone.spawnType === spawnType){
                availableZones.push(zone);
            }
        });

        Random.InitState(seed);

        let index: number = Random.Range(0, availableZones.Length);
        const selectedZone = availableZones[index];

        

        return Vector3.zero;
    }

}