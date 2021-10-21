import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import { useSelector } from 'react-redux';

const useStyles = makeStyles(theme => ({
	root: {
	},
	avatar: {
		background: theme.palette.background.default,
		transition: theme.transitions.create('all', {
			duration: theme.transitions.duration.shortest,
			easing: theme.transitions.easing.easeInOut
		}),
		bottom: 0,
		'& > img': {
			borderRadius: '50%'
		}
	}
}));

function UserNavbarHeader(props) {
	const user = useSelector(({ auth }) => auth.user);

	const classes = useStyles();

	return (
		<AppBar
			position="static"
			color="primary"
			classes={{ root: classes.root }}
			className="relative flex flex-col items-center justify-center -pt-1 pb-44 z-0 mb-36 shadow-0"
		>
			<div className="flex items-center justify-center absolute bottom-0 -mb-44">
				<Avatar
					className={clsx(classes.avatar, 'avatar w-72 h-72 p-8 box-content')}
					alt="user photo"
					src={user.photoURL && user.photoURL !== '' ? user.photoURL : 'assets/images/avatars/profile.jpg'}
				/>
			</div>
		</AppBar>
	);
}

export default UserNavbarHeader;
