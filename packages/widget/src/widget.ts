interface ProofKitConfig {
  siteId: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  apiUrl?: string;
}

interface WidgetEvent {
  id: string;
  type: 'signup' | 'purchase' | 'pageview' | 'custom';
  personName: string | null;
  personLocation: string | null;
  meta: Record<string, unknown> | null;
  createdAt: string;
}

interface CampaignConfig {
  position: string;
  theme: string;
  displayTimeMs: number;
  delayBetweenMs: number;
  maxPerSession: number;
}

interface WidgetData {
  active: boolean;
  campaign?: CampaignConfig;
  events?: WidgetEvent[];
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'just now';
}

function getEventText(event: WidgetEvent): string {
  const texts: Record<string, string> = {
    signup: 'just signed up',
    purchase: 'just purchased',
    pageview: 'is viewing this page',
    custom: 'triggered an event',
  };
  return texts[event.type] || 'just did something';
}

function getAvatar(name: string | null): string {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
}

function createToast(event: WidgetEvent, config: CampaignConfig, theme: string): HTMLElement {
  const isDark = theme === 'dark';
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    z-index: 999999;
    ${config.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
    ${config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    background: ${isDark ? '#1f2937' : '#ffffff'};
    color: ${isDark ? '#f9fafb' : '#111827'};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    max-width: 280px;
    min-width: 220px;
    transition: opacity 0.3s ease, transform 0.3s ease;
    opacity: 0;
    transform: translateY(${config.position.includes('bottom') ? '10px' : '-10px'});
    cursor: pointer;
  `;

  const avatar = document.createElement('div');
  avatar.style.cssText = `
    width: 36px; height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f97316, #ea580c);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 14px; color: white; flex-shrink: 0;
  `;
  avatar.textContent = getAvatar(event.personName);

  const content = document.createElement('div');
  const name = document.createElement('div');
  name.style.cssText = 'font-weight: 600; font-size: 13px; margin-bottom: 2px;';
  name.textContent = event.personName
    ? `${event.personName}${event.personLocation ? ` from ${event.personLocation}` : ''}`
    : (event.personLocation || 'Someone');

  const action = document.createElement('div');
  action.style.cssText = `color: ${isDark ? '#9ca3af' : '#6b7280'}; font-size: 12px;`;
  action.textContent = `${getEventText(event)} · ${timeAgo(event.createdAt)}`;

  const close = document.createElement('div');
  close.style.cssText = `
    position: absolute; top: 6px; right: 8px;
    cursor: pointer; color: ${isDark ? '#6b7280' : '#9ca3af'};
    font-size: 14px; line-height: 1;
  `;
  close.textContent = '×';
  close.onclick = (e) => {
    e.stopPropagation();
    toast.remove();
  };

  content.appendChild(name);
  content.appendChild(action);
  toast.appendChild(avatar);
  toast.appendChild(content);
  toast.appendChild(close);

  return toast;
}

export function init(config: ProofKitConfig): void {
  const apiUrl = config.apiUrl || 'https://proofkit.threestack.io';
  let shownCount = 0;

  fetch(`${apiUrl}/api/widget/${config.siteId}`)
    .then((r) => r.json())
    .then((data: WidgetData) => {
      if (!data.active || !data.campaign || !data.events?.length) return;

      // Track impression
      fetch(`${apiUrl}/api/widget/${config.siteId}/track`, { method: 'POST' }).catch(() => {});

      const campaign = data.campaign;
      const pos = config.position || campaign.position;
      const events = data.events;
      let idx = 0;

      const showNext = () => {
        if (idx >= events.length || shownCount >= campaign.maxPerSession) return;
        const event = events[idx++];
        const toast = createToast(event, { ...campaign, position: pos }, campaign.theme);
        document.body.appendChild(toast);

        // Fade in
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
          });
        });

        // Auto-hide after displayTimeMs
        setTimeout(() => {
          toast.style.opacity = '0';
          toast.style.transform = `translateY(${pos.includes('bottom') ? '10px' : '-10px'})`;
          setTimeout(() => {
            if (toast.parentNode) toast.remove();
          }, 300);
        }, campaign.displayTimeMs);

        shownCount++;
        if (shownCount < campaign.maxPerSession && idx < events.length) {
          setTimeout(showNext, campaign.displayTimeMs + campaign.delayBetweenMs);
        }
      };

      setTimeout(showNext, 1000);
    })
    .catch(console.error);
}
