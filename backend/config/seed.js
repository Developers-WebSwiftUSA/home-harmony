import User from '../models/User.model.js';
import News from '../models/News.model.js';
import { buildDefaultAvatar } from '../utils/formatAuthUser.js';

export const SUPER_ADMIN_EMAIL = (
  process.env.SUPER_ADMIN_EMAIL || 'superadmin@gmail.com'
).toLowerCase().trim();

const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'admin321';

/**
 * Ensures the built-in super admin exists on database initialization.
 * Creates the account only if it is missing; does not reset an existing password.
 */
export const seedSuperAdmin = async () => {
  const existing = await User.findOne({ email: SUPER_ADMIN_EMAIL });

  if (existing) {
    let changed = false;
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      changed = true;
    }
    if (existing.status !== 'active') {
      existing.status = 'active';
      changed = true;
    }
    if (changed) {
      await existing.save();
      console.log('Super admin account updated (role/status).');
    } else {
      console.log('Super admin account already exists.');
    }
    return;
  }

  await User.create({
    email: SUPER_ADMIN_EMAIL,
    password: SUPER_ADMIN_PASSWORD,
    role: 'admin',
    status: 'active',
    firstName: 'Super',
    lastName: 'Admin',
    avatar: buildDefaultAvatar({
      firstName: 'Super',
      lastName: 'Admin',
      email: SUPER_ADMIN_EMAIL,
    }),
  });

  console.log(`Super admin account created (${SUPER_ADMIN_EMAIL}).`);
};

const SAMPLE_NEWS = [
  {
    title: 'How to Stage Your Home for a Quick Sale',
    slug: 'how-to-stage-your-home-for-a-quick-sale',
    excerpt:
      'Simple staging choices that help buyers picture themselves in the space and can shorten time on market.',
    category: 'Selling',
    authorName: 'Kathryn M.',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    daysAgo: 2,
    content: `A well-staged home photographs better, shows better, and often sells faster. You do not need a full furniture rental to make a difference.

Start with the rooms buyers care about most: the living room, kitchen, and primary bedroom. Clear counters, add a single focal piece (a vase, a bowl of fruit, or a folded throw), and make sure every lamp works.

Natural light still wins. Open blinds, replace burnt bulbs with matching warm-white LEDs, and step outside to check the curb. Fresh mulch, a swept walk, and a wreath on the door set the tone before anyone walks in.

If a room feels empty, add one rug and two chairs rather than filling every wall. Buyers should see space to live, not a catalog of your belongings.`,
  },
  {
    title: 'Understanding Mortgage Rates in 2026',
    slug: 'understanding-mortgage-rates-in-2026',
    excerpt:
      'A practical look at how today’s rates affect buying power, monthly payments, and when it may still make sense to lock.',
    category: 'Finance',
    authorName: 'Admin',
    image:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80',
    daysAgo: 5,
    content: `Mortgage rates move with inflation data, Federal Reserve policy, and investor demand for mortgage-backed securities. For buyers, the rate is only half the story — the payment is what has to fit the budget.

A half-point change on a $450,000 loan can shift the principal-and-interest payment by more than $100 a month. That is why pre-approval letters now often include a rate range instead of a single number.

If you are buying this season, ask your lender about lock windows, float-down options, and whether points are worth buying down the rate for how long you plan to stay. Sellers who can offer a rate buydown sometimes attract more showings than a small price cut.

Rates will keep moving. A home that matches your commute, schools, and monthly comfort still matters more than trying to time the exact bottom.`,
  },
  {
    title: 'Smart Home Upgrades That Actually Raise Property Value',
    slug: 'smart-home-upgrades-that-raise-property-value',
    excerpt:
      'Not every gadget pays off. These upgrades tend to show well on tours and hold up in appraisals.',
    category: 'Technology',
    authorName: 'Andrew B.',
    image:
      'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1600&q=80',
    daysAgo: 8,
    content: `Buyers like convenience, but they also want systems they can keep after closing. The strongest smart-home upgrades are the ones that save energy or replace a dated control panel.

Thermostats, video doorbells, and exterior lighting on a simple app are easy to demo on a tour. Whole-home voice setups with proprietary hubs are harder — some buyers see them as extra work.

If you are listing soon, stick to brand-neutral Wi-Fi devices, leave the login sheet in a kitchen drawer, and mention any utility rebate you used. A smart lock with a code for the showing agent is useful; a $4,000 automated shade system rarely returns the full cost.

Think of tech as a finishing layer on a well-kept house, not a substitute for a solid roof and HVAC.`,
  },
  {
    title: 'Top Neighborhoods for First-Time Buyers This Year',
    slug: 'top-neighborhoods-for-first-time-buyers-this-year',
    excerpt:
      'Where inventory, commute, and starter-home prices are lining up better than last spring — and what to watch on each tour.',
    category: 'Market',
    authorName: 'Savannah N.',
    image:
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1600&q=80',
    daysAgo: 11,
    content: `First-time buyers are still competing, but the map has shifted. Inner-ring suburbs with bus or rail access are seeing more listings under the local median, while some coastal zip codes remain a stretch without a larger down payment.

When you tour, look past the listing photos. Walk the block at dusk, time the commute on a weekday, and ask which upgrades the seller completed with permits. A finished basement without paperwork can slow a loan.

Condo buildings deserve extra homework: HOA reserves, pending assessments, and rental caps. Townhomes with a small yard often win for buyers who want a dog and a predictable exterior.

Bring a pre-approval that matches the price band of the neighborhood you are actually shopping — not the one you hope will magically appear.`,
  },
  {
    title: 'What to Inspect Before You Make an Offer',
    slug: 'what-to-inspect-before-you-make-an-offer',
    excerpt:
      'A short checklist so you do not fall in love with a house and miss the items that turn into expensive surprises.',
    category: 'Tips',
    authorName: 'Admin',
    image:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80',
    daysAgo: 14,
    content: `You will still order a professional inspection after the offer is accepted. The walk-through before you bid is about spotting deal-breakers early.

Look at the roof from the street, check for grading that sends water toward the foundation, and open every window in the rooms you care about. Musty carpet, a double-tapped breaker, or a water heater sitting in a rust ring are worth photographing.

Ask how old the HVAC, roof, and sewer line are. In many markets those three items decide whether a “good price” is actually a project.

If the seller already has a pre-listing inspection, read it. It is not a substitute for your own inspector, but it tells you what they already know.`,
  },
  {
    title: 'Fall Open Houses: What Buyers Are Asking Now',
    slug: 'fall-open-houses-what-buyers-are-asking-now',
    excerpt:
      'Shorter days and back-to-school calendars are changing how people tour. Here is what agents hear most often at the door.',
    category: 'Market',
    authorName: 'Admin',
    image:
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80',
    scheduledDaysFromNow: 5,
    content: `Open houses in the fall are less crowded than May, which is an advantage if you want a real conversation with the listing agent. Buyers are asking about utility bills, school calendars, and whether the seller will credit closing costs instead of dropping price.

Shorter daylight means first impressions happen in warmer interior light. Leave lamps on, skip heavy scent, and keep the kitchen genuinely usable — people linger there.

If you are listing, consider a weekday twilight slot in addition to Sunday. Dual-income households still tour after work, and a quiet evening showing can produce a cleaner offer than a packed weekend.`,
  },
];

/**
 * Inserts sample property news if those slugs are not already in the database.
 */
export const seedSampleNews = async () => {
  const admin = await User.findOne({ email: SUPER_ADMIN_EMAIL }).select('_id');
  const now = Date.now();
  let created = 0;

  for (const item of SAMPLE_NEWS) {
    const exists = await News.findOne({ slug: item.slug }).select('_id');
    if (exists) continue;

    const isScheduled = Boolean(item.scheduledDaysFromNow);
    const publishedAt = isScheduled
      ? new Date(now + item.scheduledDaysFromNow * 24 * 60 * 60 * 1000)
      : new Date(now - (item.daysAgo || 0) * 24 * 60 * 60 * 1000);

    await News.create({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      content: item.content,
      image: item.image,
      category: item.category,
      authorName: item.authorName,
      status: isScheduled ? 'scheduled' : 'active',
      publishedAt,
      createdBy: admin?._id,
    });
    created += 1;
  }

  if (created) {
    console.log(`Sample news created (${created} article${created === 1 ? '' : 's'}).`);
  } else {
    console.log('Sample news already present.');
  }
};

export default seedSuperAdmin;
