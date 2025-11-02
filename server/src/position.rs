use lazy_static::lazy_static;
use rocket::serde::json::Json;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct PositionId {
    id: u32,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(crate = "rocket::serde")]
pub struct Position {
    x: f64,
    y: f64,
    floor: u32,
    name: String,
    building: String,
    brief: String,
    detail: String,
}

#[get("/position/current")]
pub(crate) fn get_current_position() -> Json<PositionId> {
    Json(PositionId { id: 1 })
}

lazy_static! {
    pub static ref places: Vec<Position> = vec![
        Position {
            x: 20.0,
            y: 20.0,
            floor: 1,
            name: "图书馆".into(),
            brief: "学校图书中心".into(),
            detail: "这里有丰富的图书资源，供学生和教职工借阅。".into(),
            building: "教学楼".into()
        },
        Position {
            x: 70.0,
            y: 50.0,
            floor: 2,
            name: "体育馆".into(),
            brief: "学校体育活动场所".into(),
            detail: "这里有各种体育设施，供学生锻炼和比赛使用。".into(),
            building: "艺体楼".into()
        }
    ];
}

#[get("/position/<id>")]
pub(crate) fn get_position_by_id(id: u32) -> Json<Position> {
    Json(places[(id as usize - 1) % places.len()].clone())
}
