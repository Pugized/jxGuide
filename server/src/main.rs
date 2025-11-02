extern crate serde;
extern crate serde_json;
#[macro_use]
extern crate rocket;
extern crate reqwest;

mod position;

use position::{get_current_position, get_position_by_id};

use rocket_cors::{AllowedOrigins, CorsOptions};

#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount("/api", routes![get_current_position, get_position_by_id])
        .attach(
            CorsOptions {
                allowed_origins: AllowedOrigins::all(),
                allow_credentials: true,
                ..Default::default()
            }
            .to_cors()
            .expect("error while building CORS"),
        )
        .configure(rocket::Config {
            address: "0.0.0.0".parse().unwrap(),
            port: 8000,
            ..rocket::Config::default()
        })
}
