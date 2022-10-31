import Form from './components/Form';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

function App() {
	return (
		<>
			<ToastContainer position="top-center" autoClose={4000} />
			<div className="flex items-center h-screen">
				<div className="container mx-auto">
					<div className="max-w-lg mx-auto px-4">
						<Form />
					</div>
				</div>
			</div>
		</>
	);
}

export default App;
