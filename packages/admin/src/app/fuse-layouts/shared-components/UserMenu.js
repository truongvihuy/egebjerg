import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { logoutUser } from 'app/auth/store/userSlice';
import { connect } from 'react-redux';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import ChangePasswordForm from './ChangePasswordForm';
import { bindActionCreators } from '@reduxjs/toolkit';
import { USER_GROUP_ADMIN } from 'app/constants';
import ConfirmDialog from 'app/shared-components/ConfirmDialog';
import axios from 'app/axios';
import { showSuccessMessage, showErrorMessage } from 'app/store/fuse/messageSlice';

function UserMenu(props) {
	const dispatch = useDispatch();
	const user = useSelector(({ auth }) => auth.user ?? {});

	const [userMenu, setUserMenu] = useState(null);

	const userMenuClick = event => {
		setUserMenu(event.currentTarget);
	};

	const userMenuClose = () => {
		setUserMenu(null);
	};

	const handleClickChangePassword = () => {
		props.openDialog({
			children: <ChangePasswordForm />
		})
	}

	const handleSetCard = () => {
		axios.put(`/customers/1`, {
			card: [{
				_id: 23210178, // test card
				type: 'primary',
				name: 'Jonh Doe',
				cardType: 'visa',
				bin: '1000000',
				lastFourDigit: '0008'
			}]
		}).then(response => {
			props.showSuccessMessage();
		});
	}

	const handleClearCard = () => {
		axios.put(`/customers/1`, { card: [] }).then(response => {
			props.showSuccessMessage();
		});
	}

	let nameSplitList = user.name.replace(/\[|\]|\(|\)/, '');
	nameSplitList = nameSplitList.split(' ');
	let shortName = nameSplitList.length > 1
		? nameSplitList[0][0].toUpperCase() + nameSplitList[nameSplitList.length - 1][0].toUpperCase()
		: nameSplitList[0][0].toUpperCase();

	return (
		<>
			<Button className="min-h-40 min-w-40 px-0 md:px-16 py-0 md:py-6" onClick={userMenuClick}>
				<div className="hidden md:flex flex-col mx-4 items-end">
					<Typography component="span" className="font-semibold flex">
						{user.name}
					</Typography>
					<Typography className="text-11 font-medium capitalize" color="textSecondary">
						{user.user_group_name}
					</Typography>
				</div>

				<Avatar className="md:mx-4">{shortName}</Avatar>
			</Button>

			<Popover
				open={Boolean(userMenu)}
				anchorEl={userMenu}
				onClose={userMenuClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center'
				}}
				classes={{
					paper: 'py-8'
				}}
			>
				{!user ? (
					<>
						<MenuItem component={Link} to="/login" role="button">
							<ListItemIcon className="min-w-40">
								<Icon>lock</Icon>
							</ListItemIcon>
							<ListItemText primary="Login" />
						</MenuItem>
						<MenuItem component={Link} to="/register" role="button">
							<ListItemIcon className="min-w-40">
								<Icon>person_add</Icon>
							</ListItemIcon>
							<ListItemText primary="Register" />
						</MenuItem>
					</>
				) : (
					<>
						{/*<MenuItem component={Link} to="/pages/profile" onClick={userMenuClose} role="button">
							<ListItemIcon className="min-w-40">
								<Icon>account_circle</Icon>
							</ListItemIcon>
							<ListItemText primary="My Profile" />
						</MenuItem>
						 <MenuItem component={Link} to="/apps/mail" onClick={userMenuClose} role="button">
							<ListItemIcon className="min-w-40">
								<Icon>mail</Icon>
							</ListItemIcon>
							<ListItemText primary="Inbox" />
						</MenuItem> */}
						<MenuItem component={Link} to="#" onClick={(e) => {
							handleClickChangePassword();
							userMenuClose(e);
						}} role="button">
							<ListItemIcon className="min-w-40">
								<Icon>vpn_key</Icon>
							</ListItemIcon>
							<ListItemText primary="Skift adgangskode" />
						</MenuItem>
						<MenuItem
							onClick={() => {
								dispatch(logoutUser());
								userMenuClose();
							}}
						>
							<ListItemIcon className="min-w-40">
								<Icon>exit_to_app</Icon>
							</ListItemIcon>
							<ListItemText primary="Log af" />
						</MenuItem>
						{user.user_group_id == USER_GROUP_ADMIN && (
							<>
								<MenuItem onClick={handleClearCard}>
									<ListItemIcon className="min-w-40">
										<Icon>clear</Icon>
									</ListItemIcon>
									<ListItemText primary="Clear Card customer [Test] Normal customer" />
								</MenuItem>
								<MenuItem onClick={(e) => {
									handleSetCard();
								}}>
									<ListItemIcon className="min-w-40">
										<Icon>check</Icon>
									</ListItemIcon>
									<ListItemText primary="Set Card customer [Test] Normal customer" />
								</MenuItem>
							</>
						)}

					</>
				)}
			</Popover>
		</>
	);
}
function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			openDialog,
			closeDialog,
			showErrorMessage,
			showSuccessMessage,
		},
		dispatch
	);
}
export default connect(null, mapDispatchToProps)(UserMenu);
