const State = require("../model/States");
const data = {
    states: require("../model/states.json"),
    setStates(data) {
        this.states = data;
    }
};

async function abbrError(res) {
    return res.status(404).json({ "message": "abbreviation parameter error" });
}

async function addEntry() {
    for (const state in data.states) {
        const fact = await State.findOne({ abbreviation: data.states[state].code }).exec();
        if (fact) {
            data.states[state].funfacts = fact.funfacts;
        }
    }
}

addEntry();

const getAllStates = async (req, res) => {
    if (req.query) {
        if (req.query.contig == "true") {
            const result = data.states.filter(st => st.code != "AK" && st.code != "HI");
            res.json(result);
            return;
        } else if (req.query.contig == "false") {
            const result = data.states.filter(st => st.code == "AK" || st.code == "HI");
            res.json(result);
            return;
        }
    }
    res.json(data.states);
};

const getState = (req, res) => {
    const code = req.params.state.toUpperCase();
    const state = data.states.find(st => st.code == code);
    if (!state) {
        abbrError(res);
    }
    res.json(state);
}

const getCapital = (req, res) => {
    const code = req.params.state.toUpperCase();
    const state = data.states.find(st => st.code == code);
    if (!state) {
        abbrError(res);
    }
    res.json({ "state": state.state, "capital": state.capital_city });
}

const getNickname = (req, res) => {
    const code = req.params.state.toUpperCase();
    const state = data.states.find(st => st.code == code);
    if (!state) {
        abbrError(res);
    }
    res.json({ "state": state.state, "nickname": state.nickname });
}

const getPopulation = (req, res) => {
    const code = req.params.state.toUpperCase();
    const state = data.states.find(st => st.code == code);
    if (!state) {
        abbrError(res);
    }
    res.json({ "state": state.state, "population": state.population.toLocaleString("en-US") });
}

const getAdmission = (req, res) => {

    const code = req.params.state.toUpperCase();
    const state = data.states.find(st => st.code == code);
    if (!state) {
        abbrError(res);
    }
    res.json({ "state": state.state, "admitted": state.admission_date });
}

const getFunFact = (req, res) => {
    const code = req.params.state.toUpperCase();
    const state = data.states.find(st => st.code == code);
    if (!state) {
        abbrError(res);
    }
    if (state.funfacts) {
        res.status(201).json({ "funfact": state.funfacts[Math.floor((Math.random() * state.funfacts.length))] });
    }
    else {
        res.status(201).json({ "message": "no facts available" });
    }
}

const createFunFact = async (req, res) => {
    if (!req?.params?.state) {
        abbrError(res);
    }
    if (!req?.body?.funfacts) {
        return res.status(400).json({ "message": "no index provided" });
    }
    if (!Array.isArray(req.body.funfacts)) {
        return res.status(400).json({ "message": "array required" });
    }
    const code = req.params.state.toUpperCase();
    try {
        if (!await State.findOneAndUpdate({ abbreviation: code }, { $push: { "funfacts": req.body.funfacts } })) {
            await State.create({
                abbreviation: code,
                funfacts: req.body.funfacts
            });
        }
        const result = await State.findOne({ abbreviation: code }).exec();
        res.status(201).json(result);
    } catch (err) { console.error(err); }
    addEntry();
}

const updateFunFact = async (req, res) => {
    if (!req?.params?.state) {
        abbrError(res);
    }
    if (!req?.body?.index) {
        return res.status(400).json({ "message": "no index value" });
    }
    if (!req?.body?.funfact) {
        return res.status(400).json({ "message": "no index value" });
    }
    const code = req.params.state.toUpperCase();
    const state = await State.findOne({ abbreviation: code }).exec();
    const curr = data.states.find(st => st.code == code);
    let index = req.body.index;
    if (!curr.funfacts || index - 1 == 0) {
        return res.status(400).json({ "message": "no facts for this state" });
    }
    if (index > state.funfacts.length || index < 1 || !index) {
        return res.status(400).json({ "message": "no facts at this index" });
    }
    index -= 1;
    if (req.body.funfact) state.funfacts[index] = req.body.funfact;
    const result = await state.save();
    res.status(201).json(result);
    addEntry();
}

const deleteFunFact = async (req, res) => {
    if (!req.params.state) {
        abbrError(res);
    }
    if (!req.body.index) {
        return res.status(400).json({ "message": "no index value found" });
    }
    const code = req.params.state.toUpperCase();

    const state = await State.findOne({ abbreviation: code }).exec();
    const curr = data.states.find(st => st.code == code);

    let index = req.body.index;
    if (!curr.funfacts || index - 1 == 0) {
        return res.status(400).json({ "message": "no facts found for this state" });
    }
    if (index > state.funfacts.length || index < 1 || !index) {
        return res.status(400).json({ "message": "no facts found for this state" });
    }
    index -= 1;
    state.funfacts.splice(index, 1);
    const result = await state.save();
    res.status(201).json(result);
    addEntry();
}

module.exports = {
    getAllStates,
    getState,
    getNickname,
    getPopulation,
    getCapital,
    getAdmission,
    getFunFact,
    createFunFact,
    updateFunFact,
    deleteFunFact
};