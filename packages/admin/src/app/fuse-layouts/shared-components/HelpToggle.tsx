import { useState } from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    typography: {
      padding: theme.spacing(2),
    },
  }),
);

const HelpToogle = props => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <>
      <Tooltip title="Help" placement="bottom">
        <IconButton aria-describedby={id} aria-label="help" onClick={handleClick}>
          <HelpOutlineIcon />
        </IconButton>

      </Tooltip>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Typography className={classes.typography}>
          <ul>
            <li>F3: Fokuser på filter</li>
            <li>Esc: Ryd det aktuelle filter</li>
            <li>F7: Tilføj nyt element</li>
            <li>F8: Ryd alt filter</li>
          </ul>
        </Typography>
      </Popover></>
  );
};

export default HelpToogle;
