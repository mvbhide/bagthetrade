var _ = require('lodash');

var commodities = 	{
		"ALUMINI" 		: "1000",
		"ALUMINIUM" 	: "5000",
		"BRCRUDEOIL" 	: "100",
		"CARDAMOM" 		: "100",
		"CASTORSEED" 	: "100",
		"COPPER" 		: "1000",
		"COPPERM" 		: "250",
		"COTTON" 		: "25",
		"CPO"	 		: "1000",
		"CRUDEOIL" 		: "100",
		"CRUDEOILM"		: "10",
		"GOLD" 			: "100",
		"GOLDGLOBAL"	: "20",
		"GOLDGUINEA"	: "1",
		"GOLDM" 		: "10",
		"GOLDPETAL"		: "1",
		"GOLDPTLDEL" 	: "1",
		"KAPAS" 		: "200",
		"LEAD" 			: "5000",
		"LEADMINI" 		: "1000",
		"MENTHOIL"		: "360",
		"NATURALGAS" 	: "1250",
		"NICKEL" 		: "250",
		"NICKELM" 		: "100",
		"PEPPER" 		: "10",
		"RBDPMOLEIN"	: "1000",
		"SILVER" 		: "30",
		"SILVER1000"	: "1",
		"SILVERM" 		: "5",
		"SILVERMIC" 	: "1",
		"ZINC" 			: "5000",
		"ZINCMINI"		: "1000" }

_.map(commodities, function(multiplier, commodity){
	console.log("UPDATE instruments SET multiplier='" + multiplier + "' WHERE tradingsymbol='" + commodity + "';");
})
