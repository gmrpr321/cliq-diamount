const router = require("express").Router();	//NO I18N

const CommonUtil = require("../services/utils/commonUtil");	//NO I18N
const appService = require("../services/appService");	//NO I18N

router.post("/", async (req, res) => {
	let responseOutput = {};
	try {
		if (!CommonUtil.isValidCliqSignature(req)) {
			return res.status(401).json({
				output: {
					text: "Unauthorized Request:Invalid signature."	//NO I18N
				}
			});
		}
		responseOutput = await appService(req.body);
	} catch (error) {
		console.log(error);
		responseOutput = CommonUtil.getBannerResponse(
			"Something went wrong. Try again later :(",	//NO I18N
			true
		);
	}

	return res.status(200).json({
		output: responseOutput
	});
});

module.exports = router;
