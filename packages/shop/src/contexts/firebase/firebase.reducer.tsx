import config from 'config/config';
export const initialState = {
    client: config.initFirebase(),
    ref: {},
};

export function FirebaseReducer(state, action) {
    switch (action.type) {
        case 'INITIAL': {
            return {
                ...state,
                ...action.payload
            };
        }
        case 'REF_ON': {
            let ref = state.client.database().ref(action.payload.route)
            if (!state.ref[action.payload.route]) {
                let firstTime = true;
                ref.on('value', snapshot => {
                    action.payload.callback({
                        thisSessionId: action.payload.sessionId,
                        newSnapshot: snapshot.val(),
                        customerState: action.payload.customerState,
                        firstTime,
                    });
                    firstTime = false;
                });
                let newState = state;
                newState.ref[action.payload.route] = true;
                return newState;
            }
            return state;
        }
        case 'REF_OFF': {
            let ref = state.client.database().ref(action.payload.route)
            ref.off('value');
            let newState = state;
            newState.ref[action.payload.route] = false;
            return newState;
        }
        default: {
            throw new Error(`Unsupported action type at App Reducer`);
        }
    }
}
