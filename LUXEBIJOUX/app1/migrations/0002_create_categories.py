from django.db import migrations
from django.utils.text import slugify


def create_categories(apps, schema_editor):
    Category = apps.get_model('app1', 'Category')
    for name in ['Rings', 'Necklaces', 'Bracelets', 'Earrings']:
        slug = slugify(name)
        Category.objects.get_or_create(name=name, slug=slug)


class Migration(migrations.Migration):

    dependencies = [
        ('app1', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_categories),
    ]
