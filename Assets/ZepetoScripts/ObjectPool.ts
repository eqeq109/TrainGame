import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Vector3 as UnityVector3, Object, Transform, Time, Mathf, Quaternion, BoxCollider, Rigidbody, FixedJoint, Debug, Vector3 } from 'UnityEngine'
import { transform } from 'typescript';

//오브젝트 풀
export default class ObjectPool<T> {
    public pool: Array<GameObject> = new Array<GameObject>();
    private prefab: GameObject;

    // start(count: int, source: GameObject){
    //     this.prefab = source;
    //     for (let i = 0; i < count; i++) {
    //         let train: GameObject = GameObject.Instantiate<GameObject>(source);
    //         Debug.Log(i.toString());
    //         this.pool.push(train);
    //         train.SetActive(false);
    //         // tails.markManagers.push(new MarkManager());
    //     }
    // }
    constructor(count: int, source: GameObject) {
        this.prefab = source;
        for (let i = 0; i < count; i++) {
            let train: GameObject = GameObject.Instantiate<GameObject>(source, new Vector3(10000, 10000, 10000), new Quaternion(0, 0, 0, 0));
            this.pool.push(train);
            train.SetActive(false);
            // tails.markManagers.push(new MarkManager());
        }
    }


    GetObject(){
        if(this.pool.length <= 0){
            for(let i = 0; i < 10; i++){
                let train: GameObject = GameObject.Instantiate<GameObject>(this.prefab);
                this.pool.push(train);
                train.SetActive(false);
            }
        }
        const pop = this.pool.pop();
        pop.SetActive(true);
        return pop;
    }

    ReturnObject(object: GameObject){
        object.SetActive(false);
        this.pool.push(object);

    }

}