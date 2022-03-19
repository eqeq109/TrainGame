using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[ExecuteInEditMode]
public class SpawnZoneGizmo : MonoBehaviour
{
    // Start is called before the first frame update
    public float Width = 0;
    public float Height = 0;

    void Start()
    {

    }

    // Update is called once per frame
    void Update()
    {

    }

    private void OnDrawGizmos()
    {
        Gizmos.color = Color.green;
        Gizmos.DrawCube(this.transform.position, new Vector3(Width, 0.1f, Height));
    }
}
