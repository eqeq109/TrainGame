declare module "ZEPETO.Multiplay.Schema" {

	import { Schema, MapSchema, ArraySchema } from "@colyseus/schema"; 


	interface State extends Schema {
		players: MapSchema<Player>;
	}
	class Player extends Schema {
		sessionId: string;
		zepetoHash: string;
		zepetoUserId: string;
		transform: Transform;
		state: number;
		exp: number;
		atkDamage: number;
	}
	class Transform extends Schema {
		position: Vector;
		rotation: Vector;
	}
	class Vector extends Schema {
		x: number;
		y: number;
		z: number;
	}
}