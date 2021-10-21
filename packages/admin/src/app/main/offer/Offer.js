import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
	layoutRoot: {}
});

function Offer() {
	const classes = useStyles();

	return (
		<FusePageSimple
			classes={{
				root: classes.layoutRoot
			}}
			header={
				<div className="p-24">
					<h4>Offer</h4>
				</div>
			}
			content={
				<div className="p-24">
					<h4>Coming soon</h4>
					<br />
				</div>
			}
		/>
	);
}

export default Offer;
