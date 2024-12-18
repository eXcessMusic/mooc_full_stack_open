const Notification = ({ message }) => {
    const styleError = {
        color: 'red',
        background: 'lightgrey',
        fontSize: 20,
        borderStyle: 'solid',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        transition: 'all 0.5s ease-in-out'
    }

    const styleSuccess = {
        color: 'green',
        background: 'lightgrey',
        fontSize: 20,
        borderStyle: 'solid',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        transition: 'all 0.5s ease-in-out'
    }

    const style = message && message.includes('successfully') ? styleSuccess : styleError;

    if (message === null) {
        return null;
    }

    if (!message) return null;

    return <div className="error" style={style}>{message}</div>;
};

export default Notification;