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
    Json(PositionId { id: 1 })
    // 1 或 2，可改
}

let places=[Position {
    x: 20.0,
    y: 20.0,
    floor: 1,
    name: "图书馆".into(),
    brief: "学校图书中心".into(),
    detail: "这里有丰富的图书资源，供学生和教职工借阅。".into()
},
Position {
    x: 70.0,
    y: 50.0,
    floor: 2,
    name: "体育馆".into(),
    brief: "学校体育活动场所".into(),
    detail: "这里有各种体育设施，供学生锻炼和比赛使用。".into()
}];


#[get("/position/<id>")]
pub(crate) fn get_position_by_id(id: u32) -> Json<Position> {
    let mut rng = rand::rng();
    Json(
        places[(id as usize - 1) % places.len()].clone()
    )
}