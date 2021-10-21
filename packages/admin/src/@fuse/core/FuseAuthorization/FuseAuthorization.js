import FuseUtils from '@fuse/utils';
import AppContext from 'app/AppContext';
import routes from 'app/fuse-configs/routesConfig';
import { Component } from 'react';
import { connect } from 'react-redux';
import { matchRoutes } from 'react-router-config';
import { withRouter } from 'react-router-dom';
import { AUTH_PERMISSION } from 'app/constants';
class FuseAuthorization extends Component {
	constructor(props, context) {
		super(props);
		const { routes } = context;
		this.state = {
			accessGranted: true,
			routes
		};
		this.mountPath = null;
	}

	componentDidMount() {
		if (!this.state.accessGranted) {
			this.mountPath = this.props.location.pathname;
			this.redirectRoute();
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		return nextState.accessGranted !== this.state.accessGranted;
	}

	componentDidUpdate() {
		if (!this.state.accessGranted) {
			this.redirectRoute();
		}
	}

	static getDerivedStateFromProps(props, state) {
		const { location, user } = props;
		const { pathname } = location;
		return {
			accessGranted: FuseUtils.hasPermission(pathname, user)
		};
	}

	redirectRoute() {
		const { location, user, history } = this.props;
		let { pathname, state } = location;
		const redirectUrl = state && state.redirectUrl ? state.redirectUrl : '/';
		/*
				User is guest
				Redirect to Login Page
				*/
		if (!user) {
			history.push({
				pathname: '/login',
			});
		} else {
			/*
				User is member
				User must be on unAuthorized page or just logged in
				Redirect to dashboard or redirectUrl
				*/
			if (this.mountPath) {
				pathname = this.mountPath;
			}
			
			const permissionKey = pathname.slice(1).replace('-', '_');
			if (user.permission[permissionKey] & AUTH_PERMISSION.access === AUTH_PERMISSION.access) {
				history.push({
					pathname: pathname
				});
			} else {
				history.push({
					pathname: redirectUrl
				});
			}
		}
	}

	render() {
		// console.info('Fuse Authorization rendered', this.state.accessGranted);
		return this.state.accessGranted ? <>{this.props.children}</> : null;
	}
}

function mapStateToProps({ auth }) {
	return {
		user: Object.keys(auth.user).length === 0 ? null : auth.user
	};
}

FuseAuthorization.contextType = AppContext;

export default withRouter(connect(mapStateToProps)(FuseAuthorization));
