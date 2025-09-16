import mongoose from 'mongoose';
import { Event } from '../src/models/event.model.js';
import { config } from '../src/config/env.js';

// Connect to MongoDB
mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    return generateSlugs();
  })
  .then(() => {
    console.log('Slug generation completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });

async function generateSlugs() {
  try {
    // Find all events without slugs
    const eventsWithoutSlugs = await Event.find({
      $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }],
    });

    console.log(`Found ${eventsWithoutSlugs.length} events without slugs`);

    for (const event of eventsWithoutSlugs) {
      // Generate slug from title
      const slug = event.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check if slug already exists
      let finalSlug = slug;
      let counter = 1;

      while (
        await Event.findOne({ slug: finalSlug, _id: { $ne: event._id } })
      ) {
        finalSlug = `${slug}-${counter}`;
        counter++;
      }

      // Update the event with the generated slug
      event.slug = finalSlug;
      await event.save();

      console.log(`Generated slug for "${event.title}": ${finalSlug}`);
    }

    console.log('All slugs generated successfully!');
  } catch (error) {
    console.error('Error generating slugs:', error);
    throw error;
  }
}
