/**
	* # asset_cache_item
	*
	* An internal datum containing info on items in the asset cache. Mainly used to cache md5 info for speed.
**/
/datum/asset_cache_item
	/// the name of this asset item, becomes the key in SSassets.cache list
	var/name
	/// md5() of the file this asset item represents.
	var/hash
	/// the file this asset represents
	var/resource
	/// our file extension e.g. .png, .gif, etc
	var/ext = ""
	/// Should this file also be sent via the legacy browse_rsc system
	/// when cdn transports are enabled?
	var/legacy = FALSE
	/// Used by the cdn system to keep legacy css assets with their parent
	/// css file. (css files resolve urls relative to the css file, so the
	/// legacy system can't be used if the css file itself could go out over
	/// the cdn)
	var/namespace = null
	/// True if this is the parent css or html file for an asset's namespace
	var/namespace_parent = FALSE
	/// TRUE for keeping local asset names when browse_rsc backend is used
	var/keep_local_name = FALSE

/datum/asset_cache_item/New(name, file)
	if(!isfile(file))
		file = fcopy_rsc(file)
	hash = md5(file)
	if(!hash)
		hash = md5(fcopy_rsc(file))
		if(!hash)
			CRASH("invalid asset sent to asset cache")
		log_debug("asset cache unexpected success of second fcopy_rsc")
	src.name = name
	var/extstart = findlasttext(name, ".")
	if(extstart)
		ext = ".[copytext(name, extstart+1)]"
	resource = file
