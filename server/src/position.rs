use rocket::serde::json::Json;
use serde::{Deserialize, Serialize};
use rand::Rng;

#[derive(Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
struct PositionId {
    id: u32
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
struct Position {
    x: f64,
    y: f64,
    floor: u32,
    name: String,
    building: String,
    brief: String,
    detail: String
}

#[get("/position/current")]
pub(crate) fn get_current_position() -> Json<PositionId> {
    let mut rng = rand::rng();
    Json(PositionId { id: rng.random_range(0..100000000) })
}

#[get("/position/<id>")]
pub(crate) fn get_position_by_id(id: u32) -> Json<Position> {
    let mut rng = rand::rng();
    Json(
        Position {
            x: rng.random_range(0.0..100.0),
            y: rng.random_range(0.0..100.0),
            floor: rng.random_range(1..5),
            name: "Position Name".into(),
            building: "Building Name".into(),
            brief: "This is a brief description.".into(),
            detail: "This is a detailed description of the position.".into()
        }
    )
}