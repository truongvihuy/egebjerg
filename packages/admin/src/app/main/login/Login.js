import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { motion } from 'framer-motion';
import JWTLogin from './JWTLogin';

function Login() {
	return (
		<div className="flex flex-col flex-auto items-center justify-center p-16 sm:p-32">
			<div className="flex flex-col items-center justify-center w-full">
				<motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}>
					<Card className="w-full max-w-384">
						<CardContent className="flex flex-col items-center justify-center p-16 sm:p-24 md:p-32">
							<img className="w-200 m-32 mt-0" src="assets/images/logos/logo.svg" alt="logo" />
							<JWTLogin />
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</div>
	);
}

export default Login;
