const requestLogger = (req, _ , next) => {
    console.log(`${req.method} ${req.url} [${new Date().toISOString()}]`);
    next();
};
export default requestLogger