import './style.css';
import { startRouter } from './router';

// Clear any residual content and start SPA router
document.querySelector<HTMLDivElement>('#app')!.innerHTML = '';

startRouter();
