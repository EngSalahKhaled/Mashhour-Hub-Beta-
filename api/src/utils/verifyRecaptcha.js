const { RecaptchaEnterpriseServiceClient } = require('@google-cloud/recaptcha-enterprise');

/**
 * Verifies a Google reCAPTCHA Enterprise token
 * @param {string} token - The token received from the frontend
 * @param {string} recaptchaAction - The action name (default: 'submit')
 * @returns {Promise<boolean>} - True if valid and score >= 0.5
 */
async function verifyRecaptcha(token, recaptchaAction = 'submit') {
    if (!token) return false;

    try {
        const projectID = "gen-lang-client-0057421495";
        const recaptchaKey = "6LcOBhAsAAAAAIxIpzP5txnOSfcBKHdfPG5cYAPv";

        // Create the reCAPTCHA client with explicit credentials
        const client = new RecaptchaEnterpriseServiceClient({
            credentials: {
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, ''),
            },
            projectId: projectID,
        });
        const projectPath = client.projectPath(projectID);

        // Build the assessment request.
        const request = {
            assessment: {
                event: {
                    token: token,
                    siteKey: recaptchaKey,
                },
            },
            parent: projectPath,
        };

        const [response] = await client.createAssessment(request);

        // Check if the token is valid.
        if (!response.tokenProperties.valid) {
            console.log(`[reCAPTCHA Enterprise] Invalid token: ${response.tokenProperties.invalidReason}`);
            return false;
        }

        // Check if the expected action was executed.
        // Note: The frontend uses 'submit' by default in our current setup.
        if (response.tokenProperties.action === recaptchaAction || recaptchaAction === 'submit') {
            const score = response.riskAnalysis.score;
            console.log(`[reCAPTCHA Enterprise] Score: ${score}`);
            
            // Return true if score is high enough (0.5+ is standard)
            return score >= 0.5;
        } else {
            console.log("[reCAPTCHA Enterprise] Action mismatch:", response.tokenProperties.action, "vs", recaptchaAction);
            return false;
        }
    } catch (error) {
        console.error('[reCAPTCHA Enterprise] Verification error:', error);
        return false;
    }
}

module.exports = verifyRecaptcha;
