module.exports = (doc, req) => {
    doc = doc.toObject();
    const accepted = ['en', 'fr'];
    let language = accepted.includes(req.headers['accept-language'])
        ? req.headers['accept-language']
        : 'en';
    let arr = doc.notifications.map(ele => {
        const lang = ele[language];
        const newDoc = { ...ele, ...lang };
        delete newDoc.en;
        delete newDoc.fr;
        return newDoc;
    });
    doc.notifications = arr;
    return doc;
};
