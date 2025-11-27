const mongoose = require('mongoose');
const uri = "mongodb+srv://onlineAirlineTicketing_db_user:zdN3TAD08vgG6UZU@cluster0.tujzo55.mongodb.net/online_airline_ticketing?appName=Cluster0";

module.exports = () => {
	return mongoose.connect(uri, {});
};