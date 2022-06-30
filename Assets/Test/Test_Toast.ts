import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button } from 'UnityEngine.UI'
import { GameObject, Time } from 'UnityEngine';
import { Animator } from 'UnityEngine';

export default class Test_Toast extends ZepetoScriptBehaviour {

    public btnSkin:Button;
    public toast:GameObject;

    private check:bool = false;
    private playTime:float = 2;
    private time:float = 0;

    Start()
    {    
        this.btnSkin.onClick.AddListener(() => {
            this.SkinBtnOn();
        });
    }

    Update()
    {
        if(this.check)
        {
            this.time += Time.deltaTime;

            if(this.time >= this.playTime)
            {
                this.toast.SetActive(false);
            }
        }
    }

    public SkinBtnOn()
    {
        this.time = 0;
        this.toast.SetActive(true);
        this.check = true;
    }

}