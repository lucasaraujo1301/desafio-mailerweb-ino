from django.contrib.postgres.operations import BtreeGistExtension
from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('core', '0002_room'),
    ]

    operations = [
        BtreeGistExtension(),
    ]
