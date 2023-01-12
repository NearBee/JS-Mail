from django.contrib import admin
from mail.models import User, Email

# Register your models here.


admin.site.register(User)


class RecipientsInline(admin.TabularInline):
    model = Email.recipients.through


class EmailAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "sender",
        "subject",
        "body",
        "read",
        "archived",
    )
    inlines = [
        RecipientsInline,
    ]
    exclude = ("recipients",)


admin.site.register(Email, EmailAdmin)
