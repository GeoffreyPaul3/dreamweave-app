-- Create a function to handle email notifications
create or replace function handle_email_notifications()
returns trigger as $$
declare
  user_email text;
  user_name text;
  listing_title text;
begin
  -- Get user email and name
  select email, full_name into user_email, user_name
  from auth.users u
  join public.profiles p on p.id = u.id
  where u.id = NEW.user_id;

  -- Handle different notification types
  case TG_TABLE_NAME
    when 'kyc_submissions' then
      if NEW.status = 'verified' and OLD.status != 'verified' then
        perform net.http_post(
          url := current_setting('app.settings.edge_function_url') || '/email-notifications',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
          ),
          body := jsonb_build_object(
            'type', 'kyc_verified',
            'userEmail', user_email,
            'userName', user_name
          )
        );
      end if;

    when 'listings' then
      -- Get listing title
      listing_title := NEW.title;

      if NEW.status = 'pending_approval' and OLD.status != 'pending_approval' then
        perform net.http_post(
          url := current_setting('app.settings.edge_function_url') || '/email-notifications',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
          ),
          body := jsonb_build_object(
            'type', 'listing_submitted',
            'userEmail', user_email,
            'userName', user_name,
            'listingTitle', listing_title,
            'listingId', NEW.id
          )
        );
      elsif NEW.status = 'active' and OLD.status != 'active' then
        perform net.http_post(
          url := current_setting('app.settings.edge_function_url') || '/email-notifications',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
          ),
          body := jsonb_build_object(
            'type', 'listing_verified',
            'userEmail', user_email,
            'userName', user_name,
            'listingTitle', listing_title,
            'listingId', NEW.id
          )
        );
      end if;
  end case;

  return NEW;
end;
$$ language plpgsql security definer;

-- Create triggers for email notifications
create trigger on_kyc_status_change
  after update on kyc_submissions
  for each row
  execute function handle_email_notifications();

create trigger on_listing_status_change
  after update on listings
  for each row
  execute function handle_email_notifications();

create trigger on_new_listing
  after insert on listings
  for each row
  execute function handle_email_notifications(); 