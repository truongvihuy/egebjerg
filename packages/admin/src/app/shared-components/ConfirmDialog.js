import React from 'react';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      'button:focus': {
        fontSize: '25px'
      },
    },
  }),
);

export default function ConfirmDialog({ title, text, handleNo, handleYes }) {
  const classes = useStyles();

	return (
		<>
			<DialogTitle>{title}</DialogTitle>
			{text ? (
				<DialogContent>
					<DialogContentText>{text}</DialogContentText>
				</DialogContent>
			) : (
				''
			)}
			<DialogActions className={classes.root}>
				<Button onClick={handleNo} color="secondary">Annuller</Button>
				<Button onClick={handleYes} color="primary" focused='true' autoFocus>OK</Button>
			</DialogActions>
		</>
	);
}
