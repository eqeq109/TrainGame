import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import { Slider, Button } from "UnityEngine.UI";

export default class PopupBase extends ZepetoScriptBehaviour {
  public CloseButton: Button;

  Start() {
    this.CloseButton.onClick.AddListener(() => {
      this.Close();
    });
  }

  public Close() {
    this.gameObject.SetActive(false);
  }
}
