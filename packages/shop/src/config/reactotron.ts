import Reactotron from 'reactotron-react-js'

type Props = {
};

const ReactotronDep: React.FC<Props> = ({ }) => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
        Reactotron.configure()
            .connect();

        Reactotron.clear();

        console.info = (type: string, message: string, ...args: any[]) => {
            switch (type) {
                case 'render':
                    return Reactotron.display({
                        name: type,
                        preview: message,
                        value: { message, args },
                    });
                case 'action':
                    return Reactotron.display({
                        name: type,
                        preview: message,
                        value: { message, args },
                    });
            }
        };
    }

    return null;
};

export default ReactotronDep;