import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

const useStyles = makeStyles(theme => ({
	root: {
		'& .logo-icon': {
			transition: theme.transitions.create(['width', 'height'], {
				duration: theme.transitions.duration.shortest,
				easing: theme.transitions.easing.easeInOut
			})
		},
		'& .react-badge, & .logo-text': {
			transition: theme.transitions.create('opacity', {
				duration: theme.transitions.duration.shortest,
				easing: theme.transitions.easing.easeInOut
			})
		}
	},
	reactBadge: {
		backgroundColor: '#121212',
		color: '#61DAFB'
	}
}));

function Logo() {
	const classes = useStyles();

	return (
		<Link className={clsx(classes.root, 'flex items-center')} to="/dashboard" role='button'>
			<svg
				className="logo-icon w-24 h-24"
				version="1.0"
				xmlns="http://www.w3.org/2000/svg"
				width="200.000000pt"
				height="200.000000pt"
				viewBox="0 0 200.000000 200.000000"
				preserveAspectRatio="xMidYMid meet"
			>
				<g transform="translate(0.000000,200.000000) scale(0.100000,-0.100000)" fill="#FFF" stroke="none">
					<path
						d="M540 1020 l0 -700 490 0 490 0 0 155 0 155 -245 0 -245 0 0 135 0 
135 225 0 225 0 0 125 0 125 -222 2 -223 3 0 128 0 128 243 0 242 0 0 154 0
155 -490 0 -490 0 0 -700z"
					/>
				</g>
			</svg>
			<Typography className="text-16 leading-none mx-12 font-medium logo-text" color="inherit">
				EGEBJERG
			</Typography>
		</Link>
	);
}

export default Logo;
