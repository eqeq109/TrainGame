import { AudioClip, AudioSource } from "UnityEngine";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";

export default class SoundManager extends ZepetoScriptBehaviour {
  public soundPlayer: AudioSource;

  public sfxLevelUp: AudioClip;
  public sfxLevelDown: AudioClip;
  public sfxGetPoint: AudioClip;
  public sfxGameOver: AudioClip;

  public PlaySound(action: string) {
    switch (action) {
      case "LevelUp":
        this.soundPlayer.clip = this.sfxLevelUp;
        break;
      case "LevelDown":
        this.soundPlayer.clip = this.sfxLevelDown;
        break;
      case "GetPoint":
        this.soundPlayer.clip = this.sfxGetPoint;
        break;
      case "GameOver":
        this.soundPlayer.clip = this.sfxGameOver;
        break;
    }

    this.soundPlayer.Play();
  }
}
