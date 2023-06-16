const respondMessage = (response, payload, message)=>{
    response.json({
        message: message || "Successful",
        payload: payload || null
    })
}

const certainRespondMessage = (response, payload, message, responseStatus)=>{
    response.status(responseStatus || 200).json({
        message: message || "Successful",
        payload: payload || null
    })
}

module.exports = {
    respondMessage, certainRespondMessage
}